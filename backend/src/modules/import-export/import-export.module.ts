import { Module } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ImportExportController } from './import-export.controller';
import { ImportService } from './import.service';
import { ExportService } from './export.service';

@Module({
  controllers: [ImportExportController],
  providers: [ImportService, ExportService, AuthGuard],
  exports: [ImportService, ExportService],
})
export class ImportExportModule {}
