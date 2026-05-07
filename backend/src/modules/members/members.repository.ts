import { Injectable } from '@nestjs/common';
import { Department, Member, MemberStatus, Position, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma/prisma.service';
import { CreateMemberAssignmentDto } from './dto/create-member-assignment.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

/**
 * Data access layer for members and assignments.
 */
@Injectable()
export class MembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    status?: string;
    department?: string;
    position?: string;
    gender?: string;
    race?: string;
    isLgbtqia?: string;
    interests?: string;
    q?: string;
    cursor?: string;
    limit: number;
  }): Promise<Member[]> {
    const where: Prisma.MemberWhereInput = {};

    if (params.status) {
      where.status = params.status as Prisma.MemberWhereInput['status'];
    }

    if (params.department) {
      where.department =
        params.department as Prisma.MemberWhereInput['department'];
    }

    if (params.position) {
      where.position = params.position as Prisma.MemberWhereInput['position'];
    }

    if (params.gender) {
      where.gender = params.gender;
    }

    if (params.race) {
      where.race = params.race;
    }

    if (params.isLgbtqia !== undefined) {
      const normalized = params.isLgbtqia === 'true';
      where.isLgbtqia = normalized;
    }

    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { email: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const interestTerms = params.interests
      ? params.interests
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : [];

    if (interestTerms.length > 0) {
      // Fetch all matching records (without interests filter) then
      // filter in JS using Unicode normalization for accent+case insensitivity.
      const all = await this.prisma.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      const normalize = (s: string) =>
        s.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');

      const normalizedTerms = interestTerms.map(normalize);

      const filtered = all.filter((m) =>
        m.interests?.some((interest) =>
          normalizedTerms.some((term) => normalize(interest).includes(term)),
        ),
      );

      let start = 0;
      if (params.cursor) {
        const idx = filtered.findIndex((m) => m.id === params.cursor);
        start = idx >= 0 ? idx + 1 : 0;
      }
      return filtered.slice(start, start + params.limit);
    }

    return this.prisma.member.findMany({
      where,
      take: params.limit,
      skip: params.cursor ? 1 : 0,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.member.findUnique({ where: { id } });
  }

  create(payload: CreateMemberDto) {
    return this.prisma.member.create({
      data: {
        name: payload.name,
        email: payload.email,
        universityId: payload.universityId,
        gender: payload.gender,
        race: payload.race,
        isLgbtqia: payload.isLgbtqia,
        status: payload.status as MemberStatus | undefined,
        position: payload.position as Position | undefined,
        department: payload.department as Department | undefined,
        joinedAt: payload.joinedAt ? new Date(payload.joinedAt) : undefined,
        leftAt: payload.leftAt ? new Date(payload.leftAt) : undefined,
        interests: payload.interests ?? [],
      },
    });
  }

  update(id: string, payload: UpdateMemberDto) {
    return this.prisma.member.update({
      where: { id },
      data: {
        name: payload.name,
        email: payload.email,
        universityId: payload.universityId,
        gender: payload.gender,
        race: payload.race,
        isLgbtqia: payload.isLgbtqia,
        status: payload.status as MemberStatus | undefined,
        position: payload.position as Position | undefined,
        department: payload.department as Department | undefined,
        joinedAt: payload.joinedAt ? new Date(payload.joinedAt) : undefined,
        leftAt: payload.leftAt ? new Date(payload.leftAt) : undefined,
        interests: payload.interests,
      },
    });
  }

  listAssignments(memberId: string) {
    return this.prisma.memberAssignment.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createAssignment(memberId: string, payload: CreateMemberAssignmentDto) {
    return this.prisma.memberAssignment.create({
      data: {
        memberId,
        description: payload.description,
        startAt: payload.startAt ? new Date(payload.startAt) : undefined,
        endAt: payload.endAt ? new Date(payload.endAt) : undefined,
      },
    });
  }

  updateStatus(id: string, status: MemberStatus) {
    return this.prisma.member.update({
      where: { id },
      data: { status },
    });
  }

  updateAssignment(
    id: string,
    payload: {
      description?: string;
      startAt?: string;
      endAt?: string;
    },
  ) {
    return this.prisma.memberAssignment.update({
      where: { id },
      data: {
        description: payload.description,
        startAt: payload.startAt ? new Date(payload.startAt) : undefined,
        endAt: payload.endAt ? new Date(payload.endAt) : undefined,
      },
    });
  }
}
