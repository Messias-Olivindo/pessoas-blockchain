import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Simple auth guard for MVP using headers as a temporary identity source.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.header('x-user-id');
    const role = request.header('x-user-role');

    if (!userId || !role) {
      throw new UnauthorizedException('Usuario nao autenticado.');
    }

    request.user = {
      id: userId,
      role,
    } as Request['user'];

    return true;
  }
}
