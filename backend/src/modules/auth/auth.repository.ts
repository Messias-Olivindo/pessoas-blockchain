import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma/prisma.service';

/**
 * Data access layer for authentication-related entities (User, Account).
 *
 * Handles upsert logic for Google OAuth flow, ensuring:
 * - Users are created or updated by email.
 * - Google Account tokens are persisted and refreshed on re-auth.
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user by email address.
   */
  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Find a user by ID, including their Google Account.
   */
  findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        accounts: {
          where: { provider: 'google' },
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            scope: true,
            // Never expose raw tokens in queries meant for API responses
          },
        },
      },
    });
  }

  /**
   * Create or update a user based on their email, then upsert the Google
   * Account record with fresh OAuth tokens.
   *
   * Uses a Prisma transaction to guarantee atomicity.
   *
   * @param profile - Google user profile data.
   * @param tokens  - OAuth tokens returned by Google.
   * @returns The upserted User record.
   */
  async upsertGoogleUser(
    profile: {
      email: string;
      name?: string;
      picture?: string;
      sub: string;
    },
    tokens: {
      access_token: string;
      refresh_token?: string | null;
      expiry_date?: number | null;
      id_token?: string | null;
      scope?: string;
      token_type?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Upsert User by email
      const user = await tx.user.upsert({
        where: { email: profile.email },
        create: {
          email: profile.email,
          name: profile.name ?? null,
          image: profile.picture ?? null,
          emailVerified: new Date(),
          status: 'APPROVED',
        },
        update: {
          name: profile.name ?? undefined,
          image: profile.picture ?? undefined,
          emailVerified: new Date(),
          status: 'APPROVED',
        },
      });

      // 2. Upsert Account by provider + providerAccountId
      await tx.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: profile.sub,
          },
        },
        create: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: profile.sub,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token ?? null,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : null,
          id_token: tokens.id_token ?? null,
          scope: tokens.scope ?? null,
          token_type: tokens.token_type ?? 'Bearer',
        },
        update: {
          access_token: tokens.access_token,
          // Only overwrite refresh_token if Google returned a new one
          ...(tokens.refresh_token
            ? { refresh_token: tokens.refresh_token }
            : {}),
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : undefined,
          id_token: tokens.id_token ?? undefined,
          scope: tokens.scope ?? undefined,
          token_type: tokens.token_type ?? undefined,
        },
      });

      return user;
    });
  }
}
