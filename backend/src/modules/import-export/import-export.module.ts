import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { ImportExportController } from './import-export.controller';
import { ImportService } from './import.service';
import { ExportService } from './export.service';

@Module({
  controllers: [ImportExportController],
  providers: [ImportService, ExportService, PrismaService, AuthGuard],
  exports: [ImportService, ExportService],
})
export class ImportExportModule {}
