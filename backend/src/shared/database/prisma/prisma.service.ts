import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma client wrapper for NestJS lifecycle hooks.
 * - Adds optional connection retry/backoff to avoid crash-loops when the DB is temporarily unavailable.
 * - Allows overriding the datasource URL to include a connection limit (useful for pgbouncer/session-mode setups).
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Optionally append a connection limit to the DATABASE_URL using env PRISMA_CONNECTION_LIMIT
    const rawUrl = process.env.DATABASE_URL;
    let dbUrl = rawUrl;
    const limit = process.env.PRISMA_CONNECTION_LIMIT;
    if (rawUrl && limit) {
      const sep = rawUrl.includes('?') ? '&' : '?';
      dbUrl = `${rawUrl}${sep}connection_limit=${encodeURIComponent(limit)}`;
    }

    // Pass an overridden datasource URL if we modified it, otherwise let Prisma pick up DATABASE_URL from env
    super(dbUrl ? { datasources: { db: { url: dbUrl } } } : {});
  }

  private async delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async onModuleInit(): Promise<void> {
    if (process.env.SKIP_DB_CONNECT === 'true') {
      this.logger.warn('SKIP_DB_CONNECT is set; skipping Prisma connection.');
      return;
    }

    const maxRetries = Number(process.env.PRISMA_CONNECT_RETRIES ?? 5);
    const baseDelay = Number(process.env.PRISMA_CONNECT_BASE_DELAY_MS ?? 1000);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting to connect to the database (attempt ${attempt + 1}/${maxRetries + 1})`);
        await this.$connect();
        this.logger.log('Prisma connected to the database');
        return;
      } catch (err) {
        const isLast = attempt === maxRetries;
        this.logger.error(`Prisma connection attempt ${attempt + 1} failed: ${err?.message ?? err}`);
        if (isLast) {
          // If user explicitly wants the process to fail on DB connect, rethrow.
          if (process.env.FAIL_ON_DB_CONNECT === 'true') {
            this.logger.error('FAIL_ON_DB_CONNECT=true, rethrowing last connection error');
            throw err;
          }
          // Otherwise, log and continue without throwing to avoid crash loops; app can still run for read-only endpoints.
          this.logger.error('Giving up connecting to DB after retries; continuing without DB connection.');
          return;
        }

        const wait = baseDelay * Math.pow(2, attempt);
        this.logger.log(`Waiting ${wait}ms before next attempt`);
        // eslint-disable-next-line no-await-in-loop
        await this.delay(wait);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
    } catch (err) {
      this.logger.warn(`Error while disconnecting Prisma: ${err?.message ?? err}`);
    }
  }
}
