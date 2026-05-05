import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './google-oauth.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    GoogleOAuthService,
    AuthRepository,
    PrismaService,
  ],
  exports: [AuthGuard, AuthService, GoogleOAuthService],
})
export class AuthModule {}
