import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma/prisma.service';
import { CreatePdiEntryDto } from './dto/create-pdi-entry.dto';
import { CreatePdiRevisionDto } from './dto/create-pdi-revision.dto';

/**
 * Data access layer for PDI entries and revisions.
 */
@Injectable()
export class PdiRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(memberId?: string) {
    return this.prisma.pdiEntry.findMany({
      where: memberId ? { memberId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { revisions: true },
    });
  }

  create(payload: CreatePdiEntryDto & { authorId?: string }) {
    return this.prisma.pdiEntry.create({
      data: {
        memberId: payload.memberId,
        authorId: payload.authorId ?? null,
        title: payload.title,
        content: payload.content,
        isActive: payload.isActive ?? true,
      },
    });
  }

  /**
   * Find a single PDI entry by ID, including its revisions.
   */
  findById(id: string) {
    return this.prisma.pdiEntry.findUnique({
      where: { id },
      include: { revisions: { orderBy: { createdAt: 'desc' } } },
    });
  }

  /**
   * Update a PDI entry and automatically record a revision with the new content.
   * Uses a Prisma transaction to ensure atomicity.
   */
  async update(
    id: string,
    payload: { title?: string; content?: string; isActive?: boolean },
    editorId?: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const updated = await tx.pdiEntry.update({
          where: { id },
          data: {
            title: payload.title,
            content: payload.content,
            isActive: payload.isActive,
          },
        });

        if (payload.content) {
          await tx.pdiEntryRevision.create({
            data: {
              pdiEntryId: id,
              editorId: editorId ?? null,
              content: payload.content,
            },
          });
        }

        return updated;
      },
      { timeout: 30000 },
    );
  }

  createRevision(pdiEntryId: string, payload: CreatePdiRevisionDto) {
    return this.prisma.pdiEntryRevision.create({
      data: {
        pdiEntryId,
        editorId: payload.editorId,
        content: payload.content,
      },
    });
  }
}
