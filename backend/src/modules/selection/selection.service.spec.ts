import { Test, TestingModule } from '@nestjs/testing';
import { SelectionService } from './selection.service';
import { SelectionRepository } from './selection.repository';

describe('SelectionService', () => {
  let service: SelectionService;
  let repository: SelectionRepository;

  const mockSelectionRepository = {
    listProcesses: jest.fn(),
    createProcess: jest.fn(),
    updateProcess: jest.fn(),
    getProcess: jest.fn(),
    listStages: jest.fn(),
    createStage: jest.fn(),
    updateStage: jest.fn(),
    listQuestions: jest.fn(),
    createQuestion: jest.fn(),
    updateQuestion: jest.fn(),
    listApplications: jest.fn(),
    getApplication: jest.fn(),
    createApplication: jest.fn(),
    updateApplicationStatus: jest.fn(),
    submitApplication: jest.fn(),
    listAnswers: jest.fn(),
    createAnswer: jest.fn(),
    upsertAnswer: jest.fn(),
    listResults: jest.fn(),
    upsertResult: jest.fn(),
    listEvaluations: jest.fn(),
    createEvaluation: jest.fn(),
    upsertEvaluation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SelectionService,
        {
          provide: SelectionRepository,
          useValue: mockSelectionRepository,
        },
      ],
    }).compile();

    service = module.get<SelectionService>(SelectionService);
    repository = module.get<SelectionRepository>(SelectionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Processes ---
  describe('processes', () => {
    it('lists processes with default pagination', async () => {
      const processes = [{ id: 'p-1' }];
      mockSelectionRepository.listProcesses.mockResolvedValue(processes);

      const result = await service.listProcesses();

      expect(result).toEqual(processes);
      expect(repository.listProcesses).toHaveBeenCalledWith({
        year: undefined,
        isActive: undefined,
        cursor: undefined,
        limit: 20,
      });
    });

    it('lists processes with custom limit', async () => {
      mockSelectionRepository.listProcesses.mockResolvedValue([]);

      await service.listProcesses({ limit: '5' });

      expect(repository.listProcesses).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5 }),
      );
    });

    it('creates a process', async () => {
      mockSelectionRepository.createProcess.mockResolvedValue({ id: 'p-1' });

      const result = await service.createProcess({
        name: 'PS 2026.1',
        year: 2026,
      });

      expect(result).toEqual({ id: 'p-1' });
      expect(repository.createProcess).toHaveBeenCalledWith({
        name: 'PS 2026.1',
        year: 2026,
      });
    });

    it('updates a process', async () => {
      mockSelectionRepository.updateProcess.mockResolvedValue({
        id: 'p-1',
        name: 'Updated',
      });

      const result = await service.updateProcess('p-1', { name: 'Updated' });

      expect(result).toEqual({ id: 'p-1', name: 'Updated' });
      expect(repository.updateProcess).toHaveBeenCalledWith('p-1', {
        name: 'Updated',
      });
    });

    it('gets a process by id', async () => {
      mockSelectionRepository.getProcess.mockResolvedValue({
        id: 'p-1',
        stages: [],
      });

      const result = await service.getProcess('p-1');

      expect(result).toEqual({ id: 'p-1', stages: [] });
      expect(repository.getProcess).toHaveBeenCalledWith('p-1');
    });
  });

  // --- Stages ---
  describe('stages', () => {
    it('lists stages for a process', async () => {
      const stages = [{ id: 's-1', order: 1 }];
      mockSelectionRepository.listStages.mockResolvedValue(stages);

      const result = await service.listStages('p-1');

      expect(result).toEqual(stages);
      expect(repository.listStages).toHaveBeenCalledWith('p-1');
    });

    it('creates a stage', async () => {
      mockSelectionRepository.createStage.mockResolvedValue({ id: 's-1' });

      const result = await service.createStage('p-1', {
        title: 'Entrevista',
        order: 1,
      });

      expect(result).toEqual({ id: 's-1' });
      expect(repository.createStage).toHaveBeenCalledWith('p-1', {
        title: 'Entrevista',
        order: 1,
      });
    });

    it('updates a stage', async () => {
      mockSelectionRepository.updateStage.mockResolvedValue({
        id: 's-1',
        title: 'Updated',
      });

      const result = await service.updateStage('s-1', { title: 'Updated' });

      expect(result).toEqual({ id: 's-1', title: 'Updated' });
    });
  });

  // --- Questions ---
  describe('questions', () => {
    it('lists questions for a stage', async () => {
      const questions = [{ id: 'q-1', order: 1 }];
      mockSelectionRepository.listQuestions.mockResolvedValue(questions);

      const result = await service.listQuestions('s-1');

      expect(result).toEqual(questions);
      expect(repository.listQuestions).toHaveBeenCalledWith('s-1');
    });

    it('creates a question', async () => {
      mockSelectionRepository.createQuestion.mockResolvedValue({ id: 'q-1' });

      const result = await service.createQuestion('s-1', {
        title: 'Question 1',
        maxScore: 10,
        order: 1,
      });

      expect(result).toEqual({ id: 'q-1' });
      expect(repository.createQuestion).toHaveBeenCalledWith('s-1', {
        title: 'Question 1',
        maxScore: 10,
        order: 1,
      });
    });

    it('updates a question', async () => {
      mockSelectionRepository.updateQuestion.mockResolvedValue({
        id: 'q-1',
        title: 'Updated',
      });

      const result = await service.updateQuestion('q-1', { title: 'Updated' });

      expect(result).toEqual({ id: 'q-1', title: 'Updated' });
    });
  });

  // --- Applications ---
  describe('applications', () => {
    it('lists applications with filters', async () => {
      const apps = [{ id: 'a-1' }];
      mockSelectionRepository.listApplications.mockResolvedValue(apps);

      const result = await service.listApplications({
        processId: 'p-1',
        status: 'DRAFT',
      });

      expect(result).toEqual(apps);
      expect(repository.listApplications).toHaveBeenCalledWith({
        processId: 'p-1',
        memberId: undefined,
        status: 'DRAFT',
        cursor: undefined,
        limit: 20,
      });
    });

    it('gets an application by id', async () => {
      mockSelectionRepository.getApplication.mockResolvedValue({ id: 'a-1' });

      const result = await service.getApplication('a-1');

      expect(result).toEqual({ id: 'a-1' });
      expect(repository.getApplication).toHaveBeenCalledWith('a-1');
    });

    it('creates an application', async () => {
      mockSelectionRepository.createApplication.mockResolvedValue({
        id: 'a-1',
      });

      const result = await service.createApplication({
        memberId: 'm-1',
        processId: 'p-1',
      });

      expect(result).toEqual({ id: 'a-1' });
      expect(repository.createApplication).toHaveBeenCalledWith({
        memberId: 'm-1',
        processId: 'p-1',
      });
    });

    it('updates application status', async () => {
      mockSelectionRepository.updateApplicationStatus.mockResolvedValue({
        id: 'a-1',
        status: 'IN_REVIEW',
      });

      const result = await service.updateApplicationStatus('a-1', 'IN_REVIEW');

      expect(result).toEqual({ id: 'a-1', status: 'IN_REVIEW' });
      expect(repository.updateApplicationStatus).toHaveBeenCalledWith(
        'a-1',
        'IN_REVIEW',
      );
    });

    it('submits an application', async () => {
      mockSelectionRepository.submitApplication.mockResolvedValue({
        id: 'a-1',
        status: 'SUBMITTED',
      });

      const result = await service.submitApplication('a-1', {
        appliedAt: '2026-05-04T12:00:00.000Z',
      });

      expect(result).toEqual({ id: 'a-1', status: 'SUBMITTED' });
    });
  });

  // --- Answers ---
  describe('answers', () => {
    it('lists answers for an application', async () => {
      const answers = [{ id: 'ans-1' }];
      mockSelectionRepository.listAnswers.mockResolvedValue(answers);

      const result = await service.listAnswers('a-1');

      expect(result).toEqual(answers);
      expect(repository.listAnswers).toHaveBeenCalledWith('a-1');
    });

    it('creates an answer', async () => {
      mockSelectionRepository.createAnswer.mockResolvedValue({ id: 'ans-1' });

      const result = await service.createAnswer('a-1', {
        questionId: 'q-1',
        answerText: 'My answer',
      });

      expect(result).toEqual({ id: 'ans-1' });
    });

    it('upserts an answer', async () => {
      mockSelectionRepository.upsertAnswer.mockResolvedValue({ id: 'ans-1' });

      const result = await service.upsertAnswer('a-1', 'q-1', {
        answerText: 'Updated',
      });

      expect(result).toEqual({ id: 'ans-1' });
      expect(repository.upsertAnswer).toHaveBeenCalledWith('a-1', 'q-1', {
        answerText: 'Updated',
      });
    });
  });

  // --- Results ---
  describe('results', () => {
    it('lists results for an application', async () => {
      const results = [{ id: 'r-1' }];
      mockSelectionRepository.listResults.mockResolvedValue(results);

      const result = await service.listResults('a-1');

      expect(result).toEqual(results);
      expect(repository.listResults).toHaveBeenCalledWith('a-1');
    });

    it('upserts a stage result', async () => {
      mockSelectionRepository.upsertResult.mockResolvedValue({ id: 'r-1' });

      const result = await service.upsertResult('a-1', 's-1', {
        status: 'PASSED',
        score: 8.5,
      });

      expect(result).toEqual({ id: 'r-1' });
      expect(repository.upsertResult).toHaveBeenCalledWith('a-1', 's-1', {
        status: 'PASSED',
        score: 8.5,
      });
    });
  });

  // --- Evaluations ---
  describe('evaluations', () => {
    it('lists evaluations for an application', async () => {
      const evals = [{ id: 'e-1' }];
      mockSelectionRepository.listEvaluations.mockResolvedValue(evals);

      const result = await service.listEvaluations('a-1');

      expect(result).toEqual(evals);
      expect(repository.listEvaluations).toHaveBeenCalledWith('a-1');
    });

    it('creates an evaluation', async () => {
      mockSelectionRepository.createEvaluation.mockResolvedValue({
        id: 'e-1',
      });

      const result = await service.createEvaluation('a-1', {
        questionId: 'q-1',
        score: 9,
        notes: 'Great!',
      });

      expect(result).toEqual({ id: 'e-1' });
    });

    it('upserts an evaluation', async () => {
      mockSelectionRepository.upsertEvaluation.mockResolvedValue({
        id: 'e-1',
      });

      const result = await service.upsertEvaluation('a-1', 'q-1', {
        score: 10,
        notes: 'Perfect',
      });

      expect(result).toEqual({ id: 'e-1' });
      expect(repository.upsertEvaluation).toHaveBeenCalledWith(
        'a-1',
        'q-1',
        { score: 10, notes: 'Perfect' },
        undefined,
      );
    });
  });
});
