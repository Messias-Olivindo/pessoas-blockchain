import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../shared/database/prisma/prisma.service';
import type { ImportResult } from './dto/import-result.dto';

/**
 * Handles parsing and importing spreadsheet data (xlsx/csv) into the database.
 *
 * Supports two flows:
 *  - `importMembers`: Upserts Member records from an integrantes spreadsheet.
 *  - `importSelection`: Creates Members + Applications from an aprovados spreadsheet.
 */
@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse an uploaded file buffer into a 2D array of rows.
   * Supports xlsx, xls, and csv files.
   */
  parseSpreadsheet(
    buffer: Buffer,
    sheetName?: string,
  ): Record<string, string>[][] {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheets = sheetName ? [sheetName] : wb.SheetNames;

    return sheets.map((name) => {
      const ws = wb.Sheets[name];
      if (!ws) throw new BadRequestException(`Sheet "${name}" nao encontrada.`);
      return XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
        defval: '',
        raw: false,
      });
    });
  }

  /**
   * Parse raw rows (header at row index 3, i.e. row 4 in Excel) from the
   * integrantes spreadsheet which has a non-standard header layout.
   */
  parseIntegrantesSheet(buffer: Buffer, sheetName: string): Array<Record<string, string>> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[sheetName];
    if (!ws) throw new BadRequestException(`Sheet "${sheetName}" nao encontrada.`);

    const rawData = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: false });

    // Header is at row index 3 (row 4 in Excel)
    const headerRow = rawData[3];
    if (!headerRow) throw new BadRequestException('Header nao encontrado na row 4.');

    // Clean header names
    const headers = headerRow.map((h) => (h ? String(h).trim() : ''));

    const results: Record<string, string>[] = [];
    for (let i = 4; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !row[1]) continue; // Skip empty rows (col 1 = Nome Completo)

      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        if (h) record[h] = row[idx] ? String(row[idx]).trim() : '';
      });
      results.push(record);
    }

    return results;
  }

  /**
   * Import members from the "[CENTRAL] BLOCKCHAIN INTEGRANTES" spreadsheet format.
   *
   * Performs upsert by email. Creates MemberAssignment from "Descricao das Atribuicoes".
   */
  async importMembers(buffer: Buffer): Promise<ImportResult> {
    const result: ImportResult = { total: 0, created: 0, updated: 0, skipped: 0, errors: [] };

    const wb = XLSX.read(buffer, { type: 'buffer' });
    const allRows: { row: Record<string, string>; sheetStatus: string }[] = [];

    for (const sheetName of wb.SheetNames) {
      const rows = this.parseIntegrantesSheet(buffer, sheetName);
      const isActive = sheetName.toLowerCase().includes('ativo') && !sheetName.toLowerCase().includes('inativo');
      rows.forEach((r) => allRows.push({ row: r, sheetStatus: isActive ? 'ACTIVE' : 'INACTIVE' }));
    }

    result.total = allRows.length;

    for (let i = 0; i < allRows.length; i++) {
      const { row, sheetStatus } = allRows[i];
      const email = (row['E-mail'] || '').toLowerCase().trim();
      const name = (row['Nome Completo'] || '').trim();

      if (!email || !name) {
        result.skipped++;
        result.errors.push({ row: i + 1, message: `Faltando nome ou email.` });
        continue;
      }

      try {
        const existing = await this.prisma.member.findUnique({ where: { email } });
        const status = row['Situação']?.toLowerCase() === 'ativo' ? 'ACTIVE'
          : row['Situação']?.toLowerCase() === 'inativo' ? 'INACTIVE'
          : sheetStatus as 'ACTIVE' | 'INACTIVE';

        const position = this.mapPosition(row['Categoria'] || row['Cargo'] || '');
        const department = this.mapDepartment(row['Cargo'] || '');
        const joinedAt = this.parseExcelDate(row['Data de Ingresso']);
        const leftAt = this.parseExcelDate(row['Data de Saída']);

        const data = {
          name,
          email,
          universityId: row['R.A.'] || null,
          status: status as any,
          position: position as any,
          department: department as any,
          joinedAt,
          leftAt,
        };

        if (existing) {
          await this.prisma.member.update({ where: { email }, data });
          result.updated++;
        } else {
          const member = await this.prisma.member.create({ data });

          // Create MemberAssignment from description if available
          const description = row['Descrição das Atribuições'] || '';
          if (description.length > 10) {
            await this.prisma.memberAssignment.create({
              data: {
                memberId: member.id,
                description,
                startAt: joinedAt,
              },
            });
          }
          result.created++;
        }
      } catch (err) {
        result.errors.push({ row: i + 1, message: (err as Error).message });
      }
    }

    this.logger.log(
      `Import members: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped, ${result.errors.length} errors`,
    );
    return result;
  }

  /**
   * Import selection data from the "Aprovados" spreadsheet format.
   *
   * Creates Members (upsert by email) and Applications linked to the given process.
   */
  async importSelection(buffer: Buffer, processId: string): Promise<ImportResult> {
    const result: ImportResult = { total: 0, created: 0, updated: 0, skipped: 0, errors: [] };

    // Verify process exists
    const process = await this.prisma.selectionProcess.findUnique({
      where: { id: processId },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
    if (!process) throw new BadRequestException(`Processo seletivo "${processId}" nao encontrado.`);

    const wb = XLSX.read(buffer, { type: 'buffer' });

    for (const sheetName of wb.SheetNames) {
      const rawData = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[sheetName], {
        header: 1,
        raw: false,
      });

      // Find header row (contains "Nome completo" or "Nome Completo")
      let headerIdx = -1;
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const row = rawData[i];
        if (row?.some((cell) => cell && /nome completo/i.test(String(cell)))) {
          headerIdx = i;
          break;
        }
      }
      if (headerIdx === -1) continue;

      const headers = rawData[headerIdx].map((h) => (h ? String(h).trim() : ''));
      const nameIdx = headers.findIndex((h) => /nome completo/i.test(h));
      const emailIdx = headers.findIndex((h) => /e-?mail/i.test(h));
      const genderIdx = headers.findIndex((h) => /g[eê]nero/i.test(h));
      const lgbtIdx = headers.findIndex((h) => /lgbtq/i.test(h));
      const raceIdx = headers.findIndex((h) => /ra[çc]a/i.test(h));
      const notaCaseIdx = headers.findIndex((h) => /nota.*case/i.test(h));
      const notaEntrevistaIdx = headers.findIndex((h) => /nota.*entrevista/i.test(h));

      for (let i = headerIdx + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || !row[nameIdx]) continue;

        result.total++;
        const name = String(row[nameIdx] || '').trim();
        const email = String(row[emailIdx] || '').toLowerCase().trim();

        if (!email || !name) {
          result.skipped++;
          continue;
        }

        try {
          // Upsert member
          const member = await this.prisma.member.upsert({
            where: { email },
            create: {
              name,
              email,
              status: 'CANDIDATE',
              gender: row[genderIdx] ? String(row[genderIdx]).trim() : null,
              isLgbtqia: row[lgbtIdx] ? /sim/i.test(String(row[lgbtIdx])) : false,
              race: row[raceIdx] ? String(row[raceIdx]).trim() : null,
            },
            update: {
              name,
              gender: row[genderIdx] ? String(row[genderIdx]).trim() : undefined,
              isLgbtqia: row[lgbtIdx] ? /sim/i.test(String(row[lgbtIdx])) : undefined,
              race: row[raceIdx] ? String(row[raceIdx]).trim() : undefined,
            },
          });

          // Upsert application
          await this.prisma.application.upsert({
            where: {
              memberId_processId: { memberId: member.id, processId },
            },
            create: {
              memberId: member.id,
              processId,
              status: 'APPROVED',
              appliedAt: new Date(),
            },
            update: {
              status: 'APPROVED',
            },
          });

          // Create stage results if stages exist and scores are present
          const caseScore = notaCaseIdx >= 0 ? parseFloat(String(row[notaCaseIdx] || '').replace(',', '.')) : NaN;
          const interviewScore = notaEntrevistaIdx >= 0 ? parseFloat(String(row[notaEntrevistaIdx] || '').replace(',', '.')) : NaN;

          const app = await this.prisma.application.findUnique({
            where: { memberId_processId: { memberId: member.id, processId } },
          });

          if (app && process.stages.length > 0 && !isNaN(caseScore)) {
            await this.prisma.stageResult.upsert({
              where: {
                applicationId_stageId: { applicationId: app.id, stageId: process.stages[0].id },
              },
              create: {
                applicationId: app.id,
                stageId: process.stages[0].id,
                status: 'PASSED',
                score: caseScore,
              },
              update: { score: caseScore, status: 'PASSED' },
            });
          }

          if (app && process.stages.length > 1 && !isNaN(interviewScore)) {
            await this.prisma.stageResult.upsert({
              where: {
                applicationId_stageId: { applicationId: app.id, stageId: process.stages[1].id },
              },
              create: {
                applicationId: app.id,
                stageId: process.stages[1].id,
                status: 'PASSED',
                score: interviewScore,
              },
              update: { score: interviewScore, status: 'PASSED' },
            });
          }

          result.created++;
        } catch (err) {
          result.errors.push({ row: i + 1, message: (err as Error).message });
        }
      }
    }

    this.logger.log(
      `Import selection (${processId}): ${result.created} created, ${result.skipped} skipped, ${result.errors.length} errors`,
    );
    return result;
  }

  // --- Helpers ---

  private mapPosition(value: string): string | null {
    const v = value.toLowerCase();
    if (v.includes('presidente')) return 'PRESIDENT';
    if (v.includes('diretor')) return 'DIRECTOR';
    if (v.includes('head')) return 'HEAD';
    if (v.includes('membro') || v.includes('regular')) return 'MEMBER';
    return 'MEMBER';
  }

  private mapDepartment(cargo: string): string | null {
    const v = cargo.toLowerCase();
    if (v.includes('marketing')) return 'MARKETING';
    if (v.includes('projeto')) return 'PROJECTS';
    if (v.includes('educa')) return 'EDUCATIONAL';
    if (v.includes('people') || v.includes('pessoa')) return 'PEOPLE';
    return null;
  }

  private parseExcelDate(value: string | undefined): Date | null {
    if (!value) return null;
    const lower = value.toLowerCase();
    if (lower.includes('aplica') || lower === '') return null;

    // Try as Excel serial number
    const num = parseFloat(value);
    if (!isNaN(num) && num > 10000) {
      // Excel epoch is 1899-12-30
      const d = new Date((num - 25569) * 86400 * 1000);
      return isNaN(d.getTime()) ? null : d;
    }

    // Try as ISO date string
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
}
