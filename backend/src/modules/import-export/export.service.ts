import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../shared/database/prisma/prisma.service';

/**
 * Handles exporting data as CSV or PDF.
 *
 * - CSV exports: Members, Selection results, PDI entries.
 * - PDF exports: Styled member profile card with selection + PDI history.
 */
@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── CSV Exports ───────────────────────────────────────────

  /**
   * Export members list as CSV buffer.
   */
  async membersToCSV(filters?: {
    status?: string;
    department?: string;
  }): Promise<Buffer> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.department) where.department = filters.department;

    const members = await this.prisma.member.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const rows = members.map((m) => ({
      Nome: m.name,
      Email: m.email,
      RA: m.universityId || '',
      Status: m.status,
      Cargo: m.position || '',
      Departamento: m.department || '',
      Genero: m.gender || '',
      Raca: m.race || '',
      LGBTQIA: m.isLgbtqia ? 'Sim' : 'Nao',
      Interesses: m.interests.join('; '),
      DataIngresso: m.joinedAt ? m.joinedAt.toISOString().split('T')[0] : '',
      DataSaida: m.leftAt ? m.leftAt.toISOString().split('T')[0] : '',
    }));

    return this.toCSVBuffer(rows);
  }

  /**
   * Export selection process results as CSV buffer.
   */
  async selectionToCSV(processId: string): Promise<Buffer> {
    const process = await this.prisma.selectionProcess.findUnique({
      where: { id: processId },
      include: {
        stages: { orderBy: { order: 'asc' } },
        applications: {
          include: {
            member: { select: { name: true, email: true } },
            results: { include: { stage: { select: { title: true } } } },
          },
        },
      },
    });

    if (!process) throw new NotFoundException('Processo seletivo nao encontrado.');

    const rows = process.applications.map((app) => {
      const base: Record<string, string> = {
        Nome: app.member.name,
        Email: app.member.email,
        Status: app.status,
        DataCandidatura: app.appliedAt ? app.appliedAt.toISOString().split('T')[0] : '',
      };

      // Add a column per stage
      for (const stage of process.stages) {
        const result = app.results.find((r) => r.stageId === stage.id);
        base[`${stage.title} - Status`] = result?.status || '';
        base[`${stage.title} - Nota`] = result?.score != null ? String(result.score) : '';
      }

      return base;
    });

    return this.toCSVBuffer(rows);
  }

  /**
   * Export PDI entries as CSV buffer.
   */
  async pdiToCSV(memberId?: string): Promise<Buffer> {
    const where: any = {};
    if (memberId) where.memberId = memberId;

    const entries = await this.prisma.pdiEntry.findMany({
      where,
      include: {
        member: { select: { name: true, email: true } },
        author: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = entries.map((e) => ({
      Membro: e.member.name,
      EmailMembro: e.member.email,
      Titulo: e.title,
      Conteudo: e.content.substring(0, 500),
      Autor: e.author?.name || e.author?.email || 'N/A',
      Ativo: e.isActive ? 'Sim' : 'Nao',
      CriadoEm: e.createdAt.toISOString().split('T')[0],
      AtualizadoEm: e.updatedAt.toISOString().split('T')[0],
    }));

    return this.toCSVBuffer(rows);
  }

  // ─── PDF Export ────────────────────────────────────────────

  /**
   * Generate a styled PDF with the member's full profile.
   *
   * Includes:
   * - Personal info (name, email, RA, gender, race, status, department, position)
   * - Selection process history (applications + stage results)
   * - PDI history
   */
  async memberToPDF(memberId: string): Promise<Buffer> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        applications: {
          include: {
            process: { select: { name: true, year: true } },
            results: {
              include: { stage: { select: { title: true, order: true } } },
              orderBy: { stage: { order: 'asc' } },
            },
          },
        },
        pdiEntries: {
          where: { isActive: true },
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        assignments: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!member) throw new NotFoundException('Membro nao encontrado.');

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ── Header ──
      doc
        .rect(0, 0, doc.page.width, 100)
        .fill('#1a1a2e');

      doc
        .fontSize(24)
        .fillColor('#e94560')
        .text('INTELI BLOCKCHAIN', 50, 25, { align: 'left' });

      doc
        .fontSize(12)
        .fillColor('#ffffff')
        .text('Ficha do Membro', 50, 55, { align: 'left' });

      doc
        .fontSize(10)
        .fillColor('#cccccc')
        .text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 50, 73, { align: 'left' });

      // ── Personal Info ──
      let y = 120;
      doc.fillColor('#1a1a2e').fontSize(16).text(member.name, 50, y);
      y += 25;

      doc.fillColor('#444444').fontSize(10);
      const info = [
        `Email: ${member.email}`,
        member.universityId ? `R.A.: ${member.universityId}` : null,
        `Status: ${member.status}`,
        member.position ? `Cargo: ${member.position}` : null,
        member.department ? `Departamento: ${member.department}` : null,
        member.gender ? `Genero: ${member.gender}` : null,
        member.race ? `Raca: ${member.race}` : null,
        `LGBTQIA+: ${member.isLgbtqia ? 'Sim' : 'Nao'}`,
        member.joinedAt ? `Ingresso: ${member.joinedAt.toLocaleDateString('pt-BR')}` : null,
      ].filter(Boolean);

      // Two-column layout
      const col1 = info.slice(0, Math.ceil(info.length / 2));
      const col2 = info.slice(Math.ceil(info.length / 2));

      col1.forEach((line, i) => {
        doc.text(line!, 50, y + i * 16);
      });
      col2.forEach((line, i) => {
        doc.text(line!, 300, y + i * 16);
      });

      y += Math.max(col1.length, col2.length) * 16 + 20;

      // ── Divider ──
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke('#e94560');
      y += 15;

      // ── Selection Process History ──
      if (member.applications.length > 0) {
        doc.fillColor('#1a1a2e').fontSize(14).text('Processo Seletivo', 50, y);
        y += 22;

        for (const app of member.applications) {
          doc.fillColor('#333333').fontSize(11)
            .text(`${app.process.name} (${app.process.year}) — ${app.status}`, 50, y);
          y += 18;

          if (app.results.length > 0) {
            doc.fontSize(9).fillColor('#666666');
            for (const r of app.results) {
              const score = r.score != null ? ` — Nota: ${r.score}` : '';
              doc.text(`  • ${r.stage.title}: ${r.status}${score}`, 65, y);
              y += 14;
            }
          }
          y += 8;
        }
      }

      // ── PDI History ──
      if (member.pdiEntries.length > 0) {
        if (y > doc.page.height - 150) { doc.addPage(); y = 50; }

        doc.moveTo(50, y).lineTo(doc.page.width - 50, y).stroke('#e94560');
        y += 15;
        doc.fillColor('#1a1a2e').fontSize(14).text('Plano de Desenvolvimento Individual', 50, y);
        y += 22;

        for (const pdi of member.pdiEntries) {
          doc.fillColor('#333333').fontSize(11).text(pdi.title, 50, y);
          y += 16;
          doc.fillColor('#888888').fontSize(8)
            .text(`Autor: ${pdi.author?.name || 'N/A'} | ${pdi.createdAt.toLocaleDateString('pt-BR')}`, 50, y);
          y += 14;

          const content = pdi.content.length > 300 ? pdi.content.substring(0, 300) + '...' : pdi.content;
          doc.fillColor('#444444').fontSize(9).text(content, 50, y, { width: 500 });
          y += doc.heightOfString(content, { width: 500 }) + 12;

          if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
        }
      }

      // ── Footer ──
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(
          'Inteli Blockchain — Gestao de Pessoas — Documento gerado automaticamente',
          50,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 100 },
        );

      doc.end();
    });
  }

  // ─── Helpers ───────────────────────────────────────────────

  private toCSVBuffer(rows: Record<string, string>[]): Buffer {
    if (rows.length === 0) {
      return Buffer.from('', 'utf-8');
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws, { FS: ',', RS: '\n' });
    // Add BOM for Excel compatibility
    return Buffer.from('\ufeff' + csv, 'utf-8');
  }
}
