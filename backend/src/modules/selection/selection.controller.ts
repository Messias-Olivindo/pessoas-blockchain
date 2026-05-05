import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
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
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpsertEvaluationDto } from './dto/upsert-evaluation.dto';
import { UpsertSelectionAnswerDto } from './dto/upsert-selection-answer.dto';
import { UpsertStageResultDto } from './dto/upsert-stage-result.dto';
import { SelectionService } from './selection.service';

/**
 * Selection process endpoints.
 */
@ApiTags('Selection')
@Controller('selection')
@UseGuards(AuthGuard, RolesGuard)
export class SelectionController {
  constructor(private readonly selectionService: SelectionService) {}

  /**
   * List selection processes.
   */
  @Get('processes')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'List selection processes' })
  @ApiOkResponse({ description: 'List of selection processes.' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listProcesses(
    @Query('year') year?: string,
    @Query('isActive') isActive?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.selectionService.listProcesses({
      year,
      isActive,
      cursor,
      limit,
    });
  }

  /**
   * Get a selection process.
   */
  @Get('processes/:id')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'Get selection process' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Selection process details.' })
  getProcess(@Param('id') processId: string) {
    return this.selectionService.getProcess(processId);
  }

  /**
   * Create a selection process.
   */
  @Post('processes')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Create selection process' })
  @ApiBody({ type: CreateProcessDto })
  @ApiOkResponse({ description: 'Selection process created.' })
  createProcess(@Body() body: CreateProcessDto) {
    return this.selectionService.createProcess(body);
  }

  /**
   * Update a selection process.
   */
  @Patch('processes/:id')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Update selection process' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateProcessDto })
  @ApiOkResponse({ description: 'Selection process updated.' })
  updateProcess(
    @Param('id') processId: string,
    @Body() body: UpdateProcessDto,
  ) {
    return this.selectionService.updateProcess(processId, body);
  }

  /**
   * List stages for a selection process.
   */
  @Get('processes/:processId/stages')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'List selection stages' })
  @ApiParam({ name: 'processId' })
  @ApiOkResponse({ description: 'Selection stages.' })
  listStages(@Param('processId') processId: string) {
    return this.selectionService.listStages(processId);
  }

  /**
   * Create a stage under a selection process.
   */
  @Post('processes/:processId/stages')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Create selection stage' })
  @ApiParam({ name: 'processId' })
  @ApiBody({ type: CreateStageDto })
  @ApiOkResponse({ description: 'Selection stage created.' })
  createStage(
    @Param('processId') processId: string,
    @Body() body: CreateStageDto,
  ) {
    return this.selectionService.createStage(processId, body);
  }

  /**
   * Update a selection stage.
   */
  @Patch('stages/:id')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Update selection stage' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateStageDto })
  @ApiOkResponse({ description: 'Selection stage updated.' })
  updateStage(@Param('id') stageId: string, @Body() body: UpdateStageDto) {
    return this.selectionService.updateStage(stageId, body);
  }

  /**
   * List questions for a stage.
   */
  @Get('stages/:stageId/questions')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'List selection questions' })
  @ApiParam({ name: 'stageId' })
  @ApiOkResponse({ description: 'Selection questions.' })
  listQuestions(@Param('stageId') stageId: string) {
    return this.selectionService.listQuestions(stageId);
  }

  /**
   * Create a question under a stage.
   */
  @Post('stages/:stageId/questions')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Create selection question' })
  @ApiParam({ name: 'stageId' })
  @ApiBody({ type: CreateQuestionDto })
  @ApiOkResponse({ description: 'Selection question created.' })
  createQuestion(
    @Param('stageId') stageId: string,
    @Body() body: CreateQuestionDto,
  ) {
    return this.selectionService.createQuestion(stageId, body);
  }

  /**
   * Update a selection question.
   */
  @Patch('questions/:id')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Update selection question' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiOkResponse({ description: 'Selection question updated.' })
  updateQuestion(
    @Param('id') questionId: string,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.selectionService.updateQuestion(questionId, body);
  }

  /**
   * List applications.
   */
  @Get('applications')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'List applications' })
  @ApiOkResponse({ description: 'Applications list.' })
  @ApiQuery({ name: 'processId', required: false })
  @ApiQuery({ name: 'memberId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listApplications(
    @Query('processId') processId?: string,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.selectionService.listApplications({
      processId,
      memberId,
      status,
      cursor,
      limit,
    });
  }

  /**
   * Get application details.
   */
  @Get('applications/:id')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'Get application' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Application details.' })
  getApplication(@Param('id') applicationId: string) {
    return this.selectionService.getApplication(applicationId);
  }

  /**
   * Create an application for a member.
   */
  @Post('applications')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Create application' })
  @ApiBody({ type: CreateApplicationDto })
  @ApiOkResponse({ description: 'Application created.' })
  createApplication(@Body() body: CreateApplicationDto) {
    return this.selectionService.createApplication(body);
  }

  /**
   * Submit an application.
   */
  @Patch('applications/:id/submit')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Submit application' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: SubmitApplicationDto })
  @ApiOkResponse({ description: 'Application submitted.' })
  submitApplication(
    @Param('id') applicationId: string,
    @Body() body: SubmitApplicationDto,
  ) {
    return this.selectionService.submitApplication(applicationId, body);
  }

  /**
   * Update application status.
   */
  @Patch('applications/:id/status')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Update application status' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateApplicationStatusDto })
  @ApiOkResponse({ description: 'Application status updated.' })
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() body: UpdateApplicationStatusDto,
  ) {
    return this.selectionService.updateApplicationStatus(id, body.status);
  }

  /**
   * List stage results for an application.
   */
  @Get('applications/:id/results')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'List application results' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Stage results.' })
  listResults(@Param('id') applicationId: string) {
    return this.selectionService.listResults(applicationId);
  }

  /**
   * Upsert a stage result for an application.
   */
  @Patch('applications/:id/results/:stageId')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Upsert stage result' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'stageId' })
  @ApiBody({ type: UpsertStageResultDto })
  @ApiOkResponse({ description: 'Stage result upserted.' })
  upsertResult(
    @Param('id') applicationId: string,
    @Param('stageId') stageId: string,
    @Body() body: UpsertStageResultDto,
  ) {
    return this.selectionService.upsertResult(applicationId, stageId, body);
  }

  /**
   * List answers for an application.
   */
  @Get('applications/:id/answers')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'List application answers' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Application answers.' })
  listAnswers(@Param('id') applicationId: string) {
    return this.selectionService.listAnswers(applicationId);
  }

  /**
   * Create an answer for an application.
   */
  @Post('applications/:id/answers')
  @Roles('ADMIN', 'PEOPLE')
  @ApiOperation({ summary: 'Create application answer' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: CreateSelectionAnswerDto })
  @ApiOkResponse({ description: 'Application answer created.' })
  addAnswer(
    @Param('id') applicationId: string,
    @Body() body: CreateSelectionAnswerDto,
  ) {
    return this.selectionService.createAnswer(applicationId, body);
  }

  /**
   * Upsert an answer for a question.
   */
  @Patch('applications/:id/answers/:questionId')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'Upsert application answer' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'questionId' })
  @ApiBody({ type: UpsertSelectionAnswerDto })
  @ApiOkResponse({ description: 'Application answer upserted.' })
  upsertAnswer(
    @Param('id') applicationId: string,
    @Param('questionId') questionId: string,
    @Body() body: UpsertSelectionAnswerDto,
  ) {
    return this.selectionService.upsertAnswer(applicationId, questionId, body);
  }

  /**
   * Create an evaluation for an application.
   */
  @Post('applications/:id/evaluations')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'Create application evaluation' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: CreateEvaluationDto })
  @ApiOkResponse({ description: 'Application evaluation created.' })
  addEvaluation(
    @Param('id') applicationId: string,
    @Body() body: CreateEvaluationDto,
  ) {
    return this.selectionService.createEvaluation(applicationId, body);
  }

  /**
   * List evaluations for an application.
   */
  @Get('applications/:id/evaluations')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'List application evaluations' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Application evaluations.' })
  listEvaluations(@Param('id') applicationId: string) {
    return this.selectionService.listEvaluations(applicationId);
  }

  /**
   * Upsert an evaluation for a question.
   */
  @Patch('applications/:id/evaluations/:questionId')
  @Roles('ADMIN', 'PEOPLE', 'INTERVIEWER')
  @ApiOperation({ summary: 'Upsert application evaluation' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'questionId' })
  @ApiBody({ type: UpsertEvaluationDto })
  @ApiOkResponse({ description: 'Application evaluation upserted.' })
  upsertEvaluation(
    @Param('id') applicationId: string,
    @Param('questionId') questionId: string,
    @Body() body: UpsertEvaluationDto,
  ) {
    return this.selectionService.upsertEvaluation(
      applicationId,
      questionId,
      body,
    );
  }
}
