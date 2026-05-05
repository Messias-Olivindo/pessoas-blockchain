import { Injectable } from '@nestjs/common';
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
import { SelectionRepository } from './selection.repository';

/**
 * Serviço central para orquestração de Processos Seletivos.
 * Engloba criação de processos, etapas, questões, além do acompanhamento de candidaturas, respostas e avaliações.
 */
@Injectable()
export class SelectionService {
  constructor(private readonly selectionRepository: SelectionRepository) {}

  /**
   * Recupera a lista de todos os processos seletivos cadastrados.
   *
   * @returns Array de processos seletivos.
   */
  listProcesses(params?: {
    year?: string;
    isActive?: string;
    cursor?: string;
    limit?: string;
  }) {
    const limit = params?.limit ? Number(params.limit) : 20;
    return this.selectionRepository.listProcesses({
      year: params?.year,
      isActive: params?.isActive,
      cursor: params?.cursor,
      limit,
    });
  }

  /**
   * Cadastra um novo processo seletivo (ex: PS 2026.1).
   *
   * @param payload - DTO contendo ano e nome do processo.
   * @returns O processo seletivo recém-criado.
   */
  createProcess(payload: CreateProcessDto) {
    return this.selectionRepository.createProcess(payload);
  }

  updateProcess(processId: string, payload: UpdateProcessDto) {
    return this.selectionRepository.updateProcess(processId, payload);
  }

  getProcess(processId: string) {
    return this.selectionRepository.getProcess(processId);
  }

  listStages(processId: string) {
    return this.selectionRepository.listStages(processId);
  }

  /**
   * Adiciona uma etapa (fase) a um processo seletivo existente.
   *
   * @param processId - ID único do processo seletivo.
   * @param payload - DTO com o título e a ordem da etapa.
   * @returns A nova etapa criada no banco.
   */
  createStage(processId: string, payload: CreateStageDto) {
    return this.selectionRepository.createStage(processId, payload);
  }

  updateStage(stageId: string, payload: UpdateStageDto) {
    return this.selectionRepository.updateStage(stageId, payload);
  }

  listQuestions(stageId: string) {
    return this.selectionRepository.listQuestions(stageId);
  }

  /**
   * Vincula uma nova questão avaliativa a uma etapa de um processo seletivo.
   *
   * @param stageId - ID da etapa à qual a questão pertence.
   * @param payload - DTO contendo o enunciado, pontuação máxima e peso da questão.
   * @returns A questão criada.
   */
  createQuestion(stageId: string, payload: CreateQuestionDto) {
    return this.selectionRepository.createQuestion(stageId, payload);
  }

  updateQuestion(questionId: string, payload: UpdateQuestionDto) {
    return this.selectionRepository.updateQuestion(questionId, payload);
  }

  listApplications(params: {
    processId?: string;
    memberId?: string;
    status?: string;
    cursor?: string;
    limit?: string;
  }) {
    const limit = params.limit ? Number(params.limit) : 20;
    return this.selectionRepository.listApplications({
      processId: params.processId,
      memberId: params.memberId,
      status: params.status,
      cursor: params.cursor,
      limit,
    });
  }

  getApplication(applicationId: string) {
    return this.selectionRepository.getApplication(applicationId);
  }

  /**
   * Registra a candidatura de um membro num processo seletivo.
   *
   * @param payload - DTO com o ID do membro candidato e o ID do processo.
   * @returns A candidatura gerada.
   */
  createApplication(payload: CreateApplicationDto) {
    return this.selectionRepository.createApplication(payload);
  }

  /**
   * Altera o status atual de uma candidatura (ex: PENDENTE, APROVADO, REPROVADO).
   *
   * @param id - ID único da candidatura.
   * @param status - Novo status desejado.
   * @returns A candidatura com status atualizado.
   */
  updateApplicationStatus(id: string, status: string) {
    return this.selectionRepository.updateApplicationStatus(id, status);
  }

  submitApplication(id: string, payload: SubmitApplicationDto) {
    return this.selectionRepository.submitApplication(id, payload);
  }

  /**
   * Lista todas as respostas providas por um candidato em sua candidatura.
   *
   * @param applicationId - ID único da candidatura.
   * @returns Array com as respostas submetidas.
   */
  listAnswers(applicationId: string) {
    return this.selectionRepository.listAnswers(applicationId);
  }

  /**
   * Adiciona uma nova resposta de um candidato para uma questão de alguma etapa.
   *
   * @param applicationId - ID único da candidatura.
   * @param payload - DTO com o ID da questão e o texto da resposta.
   * @returns O registro da resposta armazenado no banco.
   */
  createAnswer(applicationId: string, payload: CreateSelectionAnswerDto) {
    return this.selectionRepository.createAnswer(applicationId, payload);
  }

  upsertAnswer(
    applicationId: string,
    questionId: string,
    payload: UpsertSelectionAnswerDto,
  ) {
    return this.selectionRepository.upsertAnswer(
      applicationId,
      questionId,
      payload,
    );
  }

  listResults(applicationId: string) {
    return this.selectionRepository.listResults(applicationId);
  }

  upsertResult(
    applicationId: string,
    stageId: string,
    payload: UpsertStageResultDto,
  ) {
    return this.selectionRepository.upsertResult(
      applicationId,
      stageId,
      payload,
    );
  }

  listEvaluations(applicationId: string) {
    return this.selectionRepository.listEvaluations(applicationId);
  }

  /**
   * Adiciona uma nova avaliação (nota/feedback) dada a uma resposta ou critério do candidato.
   *
   * @param applicationId - ID da candidatura sendo avaliada.
   * @param payload - DTO com o ID da questão, nota e anotações do avaliador.
   * @returns A avaliação salva.
   */
  createEvaluation(applicationId: string, payload: CreateEvaluationDto) {
    return this.selectionRepository.createEvaluation(applicationId, payload);
  }

  upsertEvaluation(
    applicationId: string,
    questionId: string,
    payload: UpsertEvaluationDto,
    evaluatorId?: string,
  ) {
    return this.selectionRepository.upsertEvaluation(
      applicationId,
      questionId,
      payload,
      evaluatorId,
    );
  }
}
