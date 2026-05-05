import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma/prisma.service';

/**
 * Data access layer for users.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: {
    role?: string;
    status?: string;
    q?: string;
    cursor?: string;
    limit: number;
  }) {
    const where: Record<string, unknown> = {};

    if (params.role) {
      where.role = params.role;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { email: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      take: params.limit,
      skip: params.cursor ? 1 : 0,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
    });
  }

  updateRole(id: string, role: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: role as UserRole },
    });
  }
}
