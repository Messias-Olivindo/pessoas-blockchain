import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../shared/database/prisma/prisma.service';

/**
 * Auth guard that validates x-user-id against the database.
 *
 * Role is read from the DB — the x-user-role header is intentionally ignored
 * to prevent privilege escalation by a client-side header forgery.
 * Only APPROVED users can access protected endpoints.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.header('x-user-id');

    if (!userId) {
      throw new UnauthorizedException('Usuario nao autenticado.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario nao encontrado.');
    }

    if (user.status !== 'APPROVED') {
      throw new ForbiddenException('Conta pendente de aprovacao.');
    }

    request.user = { id: user.id, role: user.role } as Request['user'];

    return true;
  }
}
