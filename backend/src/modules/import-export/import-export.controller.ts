import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ImportService } from './import.service';
import { ExportService } from './export.service';

/**
 * Import/Export endpoints for bulk data operations.
 *
 * All endpoints require ADMIN or PEOPLE role.
 *
 * Import:
 *  - POST /import/members — upload xlsx/csv with integrantes data
 *  - POST /import/selection — upload xlsx with aprovados data
 *
 * Export:
 *  - GET /export/members/csv — download members as CSV
 *  - GET /export/members/:id/pdf — download member profile as PDF
 *  - GET /export/selection/:processId/csv — download selection results as CSV
 *  - GET /export/pdi/csv — download PDI entries as CSV
 */
@ApiTags('Import/Export')
@Controller()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'PEOPLE')
export class ImportExportController {
  constructor(
    private readonly importService: ImportService,
    private readonly exportService: ExportService,
  ) {}

  // ─── Import ────────────────────────────────────────────────

  @Post('import/members')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import members from xlsx/csv',
    description:
      'Upload a spreadsheet with member data. Performs upsert by email. ' +
      'Supports the "[CENTRAL] BLOCKCHAIN INTEGRANTES" format.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async importMembers(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo nao enviado.');
    return this.importService.importMembers(file.buffer);
  }

  @Post('import/selection')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import selection data from xlsx',
    description:
      'Upload an "Aprovados" spreadsheet. Creates Members + Applications. ' +
      'Requires a processId query parameter to link candidates to a process.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'processId', required: true, description: 'ID of the selection process' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async importSelection(
    @UploadedFile() file: Express.Multer.File,
    @Query('processId') processId: string,
  ) {
    if (!file) throw new BadRequestException('Arquivo nao enviado.');
    if (!processId) throw new BadRequestException('processId e obrigatorio.');
    return this.importService.importSelection(file.buffer, processId);
  }

  // ─── Export CSV ────────────────────────────────────────────

  @Get('export/members/csv')
  @ApiOperation({ summary: 'Export members as CSV' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiOkResponse({ description: 'CSV file download.' })
  async exportMembersCSV(
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('department') department?: string,
  ) {
    const csvBuffer = await this.exportService.membersToCSV({ status, department });
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="membros_${new Date().toISOString().split('T')[0]}.csv"`,
    });
    res.send(csvBuffer);
  }

  @Get('export/selection/:processId/csv')
  @ApiOperation({ summary: 'Export selection process results as CSV' })
  @ApiParam({ name: 'processId', description: 'Selection process ID' })
  @ApiOkResponse({ description: 'CSV file download.' })
  async exportSelectionCSV(
    @Res() res: Response,
    @Param('processId') processId: string,
  ) {
    const csvBuffer = await this.exportService.selectionToCSV(processId);
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="selecao_${processId}.csv"`,
    });
    res.send(csvBuffer);
  }

  @Get('export/pdi/csv')
  @ApiOperation({ summary: 'Export PDI entries as CSV' })
  @ApiQuery({ name: 'memberId', required: false })
  @ApiOkResponse({ description: 'CSV file download.' })
  async exportPdiCSV(
    @Res() res: Response,
    @Query('memberId') memberId?: string,
  ) {
    const csvBuffer = await this.exportService.pdiToCSV(memberId);
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pdi_${new Date().toISOString().split('T')[0]}.csv"`,
    });
    res.send(csvBuffer);
  }

  // ─── Export PDF ────────────────────────────────────────────

  @Get('export/members/:id/pdf')
  @ApiOperation({
    summary: 'Export member profile as styled PDF',
    description:
      'Generates a PDF with full member info: demographics, selection process ' +
      'history (scores per stage), and active PDI entries.',
  })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiOkResponse({ description: 'PDF file download.' })
  async exportMemberPDF(
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const pdfBuffer = await this.exportService.memberToPDF(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="membro_${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }
}
