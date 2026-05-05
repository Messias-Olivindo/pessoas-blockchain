import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../shared/database/prisma/prisma.service';
import { PdiController } from './pdi.controller';
import { PdiRepository } from './pdi.repository';
import { PdiService } from './pdi.service';

@Module({
  imports: [AuthModule],
  controllers: [PdiController],
  providers: [PdiService, PdiRepository, PrismaService],
})
export class PdiModule {}
