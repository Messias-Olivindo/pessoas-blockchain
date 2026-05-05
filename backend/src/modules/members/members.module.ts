import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../shared/database/prisma/prisma.service';
import { MembersController } from './members.controller';
import { MembersRepository } from './members.repository';
import { MembersService } from './members.service';

@Module({
  imports: [AuthModule],
  controllers: [MembersController],
  providers: [MembersService, MembersRepository, PrismaService],
  exports: [MembersService],
})
export class MembersModule {}
