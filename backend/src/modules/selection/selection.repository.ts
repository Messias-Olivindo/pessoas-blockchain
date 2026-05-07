import { Injectable } from '@nestjs/common';
import { ApplicationStatus, StageResultStatus } from '@prisma/client';
import { PrismaService } from '../../shared/database/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { CreateProcessDto } from './dto/create-process.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateSelectionAnswerDto } from './dto/create-selection-answer.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { UpsertEvaluationDto } from './dto/upsert-evaluation.dto';
import { UpsertSelectionAnswerDto } from './dto/upsert-selection-answer.dto';
import { UpsertStageResultDto } from './dto/upsert-stage-result.dto';

/**
 * Data access layer for selection process entities.
 */
@Injectable()
export class SelectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  listProcesses(params?: {
    year?: string;
    isActive?: string;
    cursor?: string;
    limit?: number;
  }) {
    const where: Record<string, unknown> = {};
    if (params?.year) {
      where.year = Number(params.year);
    }
    if (params?.isActive) {
      where.isActive = params.isActive === 'true';
    }
    return this.prisma.selectionProcess.findMany({
      where,
      take: params?.limit,
      skip: params?.cursor ? 1 : 0,
      cursor: params?.cursor ? { id: params.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { stages: true },
    });
  }

  createProcess(payload: CreateProcessDto) {
    return this.prisma.selectionProcess.create({
      data: {
        name: payload.name,
        year: payload.year,
        isActive: payload.isActive ?? true,
      },
    });
  }

  updateProcess(processId: string, payload: UpdateProcessDto) {
    return this.prisma.selectionProcess.update({
      where: { id: processId },
      data: {
        name: payload.name,
        year: payload.year,
        isActive: payload.isActive,
      },
    });
  }

  getProcess(processId: string) {
    return this.prisma.selectionProcess.findUnique({
      where: { id: processId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            questions: { orderBy: { order: 'asc' } },
          },
        },
      },
    });
  }

  listStages(processId: string) {
    return this.prisma.selectionStage.findMany({
      where: { processId },
      orderBy: { order: 'asc' },
    });
  }

  createStage(processId: string, payload: CreateStageDto) {
    return this.prisma.selectionStage.create({
      data: {
        processId,
        title: payload.title,
        order: payload.order,
      },
    });
  }

  updateStage(stageId: string, payload: UpdateStageDto) {
    return this.prisma.selectionStage.update({
      where: { id: stageId },
      data: {
        title: payload.title,
        order: payload.order,
      },
    });
  }

  listQuestions(stageId: string) {
    return this.prisma.selectionQuestion.findMany({
      where: { stageId },
      orderBy: { order: 'asc' },
    });
  }

  createQuestion(stageId: string, payload: CreateQuestionDto) {
    return this.prisma.selectionQuestion.create({
      data: {
        stageId,
        title: payload.title,
        description: payload.description,
        maxScore: payload.maxScore,
        weight: payload.weight ?? 1,
        order: payload.order,
      },
    });
  }

  updateQuestion(questionId: string, payload: UpdateQuestionDto) {
    return this.prisma.selectionQuestion.update({
      where: { id: questionId },
      data: {
        title: payload.title,
        description: payload.description,
        maxScore: payload.maxScore,
        weight: payload.weight,
        order: payload.order,
      },
    });
  }

  listApplications(params: {
    processId?: string;
    memberId?: string;
    status?: string;
    cursor?: string;
    limit: number;
  }) {
    const where: Record<string, unknown> = {};
    if (params.processId) {
      where.processId = params.processId;
    }
    if (params.memberId) {
      where.memberId = params.memberId;
    }
    if (params.status) {
      where.status = params.status as ApplicationStatus;
    }

    return this.prisma.application.findMany({
      where,
      take: params.limit,
      skip: params.cursor ? 1 : 0,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
            race: true,
            isLgbtqia: true,
          },
        },
        process: {
          select: { id: true, name: true, year: true },
        },
        results: {
          include: {
            stage: { select: { id: true, title: true, order: true } },
          },
          orderBy: { stage: { order: 'asc' } },
        },
      },
    });
  }

  getApplication(applicationId: string) {
    return this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
            race: true,
            isLgbtqia: true,
          },
        },
        process: {
          select: { id: true, name: true, year: true },
        },
        results: {
          include: {
            stage: { select: { id: true, title: true, order: true } },
          },
          orderBy: { stage: { order: 'asc' } },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                order: true,
                stageId: true,
                stage: { select: { id: true, title: true, order: true } },
              },
            },
          },
          orderBy: { question: { order: 'asc' } },
        },
        evaluations: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                order: true,
                maxScore: true,
                stageId: true,
                stage: { select: { id: true, title: true, order: true } },
              },
            },
          },
          orderBy: { question: { order: 'asc' } },
        },
      },
    });
  }

  createApplication(payload: CreateApplicationDto) {
    return this.prisma.application.create({
      data: {
        memberId: payload.memberId,
        processId: payload.processId,
        status: (payload.status ?? 'DRAFT') as ApplicationStatus,
        appliedAt: payload.appliedAt ? new Date(payload.appliedAt) : undefined,
        notes: payload.notes,
      },
    });
  }

  updateApplicationStatus(id: string, status: string) {
    return this.prisma.application.update({
      where: { id },
      data: { status: status as ApplicationStatus },
    });
  }

  submitApplication(id: string, payload: SubmitApplicationDto) {
    return this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        appliedAt: new Date(payload.appliedAt),
      },
    });
  }

  listAnswers(applicationId: string) {
    return this.prisma.selectionAnswer.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  createAnswer(applicationId: string, payload: CreateSelectionAnswerDto) {
    return this.prisma.selectionAnswer.create({
      data: {
        applicationId,
        questionId: payload.questionId,
        answerText: payload.answerText,
      },
    });
  }

  upsertAnswer(
    applicationId: string,
    questionId: string,
    payload: UpsertSelectionAnswerDto,
  ) {
    return this.prisma.selectionAnswer.upsert({
      where: {
        applicationId_questionId: {
          applicationId,
          questionId,
        },
      },
      create: {
        applicationId,
        questionId,
        answerText: payload.answerText,
      },
      update: {
        answerText: payload.answerText,
      },
    });
  }

  listResults(applicationId: string) {
    return this.prisma.stageResult.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  upsertResult(
    applicationId: string,
    stageId: string,
    payload: UpsertStageResultDto,
  ) {
    return this.prisma.stageResult.upsert({
      where: {
        applicationId_stageId: {
          applicationId,
          stageId,
        },
      },
      create: {
        applicationId,
        stageId,
        status: payload.status as StageResultStatus,
        score: payload.score,
        notes: payload.notes,
        decidedAt: payload.decidedAt ? new Date(payload.decidedAt) : undefined,
      },
      update: {
        status: payload.status as StageResultStatus,
        score: payload.score,
        notes: payload.notes,
        decidedAt: payload.decidedAt ? new Date(payload.decidedAt) : undefined,
      },
    });
  }

  listEvaluations(applicationId: string) {
    return this.prisma.candidateEvaluation.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  createEvaluation(applicationId: string, payload: CreateEvaluationDto) {
    return this.prisma.candidateEvaluation.create({
      data: {
        applicationId,
        questionId: payload.questionId,
        evaluatorId: payload.evaluatorId,
        score: payload.score,
        notes: payload.notes,
      },
    });
  }

  upsertEvaluation(
    applicationId: string,
    questionId: string,
    payload: UpsertEvaluationDto,
    evaluatorId?: string,
  ) {
    return this.prisma.candidateEvaluation.upsert({
      where: {
        applicationId_questionId: {
          applicationId,
          questionId,
        },
      },
      create: {
        applicationId,
        questionId,
        evaluatorId: evaluatorId,
        score: payload.score,
        notes: payload.notes,
      },
      update: {
        score: payload.score,
        notes: payload.notes,
      },
    });
  }
}
