import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersRepository } from './members.repository';

describe('MembersService', () => {
  let service: MembersService;
  let repository: MembersRepository;

  const mockMembersRepository = {
    findMany: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    listAssignments: jest.fn(),
    createAssignment: jest.fn(),
    updateAssignment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: MembersRepository,
          useValue: mockMembersRepository,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    repository = module.get<MembersRepository>(MembersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('lists members with default limit of 20', async () => {
      const members = [{ id: 'm-1' }];
      mockMembersRepository.findMany.mockResolvedValue(members);

      const result = await service.list({});

      expect(result).toEqual(members);
      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20 }),
      );
    });

    it('passes filters through to repository', async () => {
      mockMembersRepository.findMany.mockResolvedValue([]);

      await service.list({
        status: 'ACTIVE',
        department: 'PROJECTS',
        gender: 'F',
        race: 'Parda',
        isLgbtqia: 'true',
        interests: 'solana,pesquisa',
        q: 'ana',
        cursor: 'uuid-cursor',
        limit: '10',
      });

      expect(repository.findMany).toHaveBeenCalledWith({
        status: 'ACTIVE',
        department: 'PROJECTS',
        position: undefined,
        gender: 'F',
        race: 'Parda',
        isLgbtqia: 'true',
        interests: 'solana,pesquisa',
        q: 'ana',
        cursor: 'uuid-cursor',
        limit: 10,
      });
    });

    it('uses custom limit when provided', async () => {
      mockMembersRepository.findMany.mockResolvedValue([]);

      await service.list({ limit: '5' });

      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5 }),
      );
    });
  });

  describe('getById', () => {
    it('returns member when found', async () => {
      const member = { id: 'm-1', name: 'Ana' };
      mockMembersRepository.findById.mockResolvedValue(member);

      const result = await service.getById('m-1');

      expect(result).toEqual(member);
      expect(repository.findById).toHaveBeenCalledWith('m-1');
    });

    it('throws NotFoundException when member is not found', async () => {
      mockMembersRepository.findById.mockResolvedValue(null);

      await expect(service.getById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a member with required fields', async () => {
      const payload = { name: 'Member', email: 'member@example.com' };
      mockMembersRepository.create.mockResolvedValue({ id: 'm-1' });

      const result = await service.create(payload as never);

      expect(result).toEqual({ id: 'm-1' });
      expect(repository.create).toHaveBeenCalledWith(payload);
    });
  });

  describe('update', () => {
    it('updates a member', async () => {
      mockMembersRepository.update.mockResolvedValue({ id: 'm-1' });

      const result = await service.update('m-1', { status: 'ACTIVE' } as never);

      expect(result).toEqual({ id: 'm-1' });
      expect(repository.update).toHaveBeenCalledWith('m-1', {
        status: 'ACTIVE',
      });
    });
  });

  describe('updateStatus', () => {
    it('updates member status', async () => {
      mockMembersRepository.updateStatus.mockResolvedValue({
        id: 'm-1',
        status: 'ALUMNI',
      });

      const result = await service.updateStatus('m-1', 'ALUMNI');

      expect(result).toEqual({ id: 'm-1', status: 'ALUMNI' });
      expect(repository.updateStatus).toHaveBeenCalledWith('m-1', 'ALUMNI');
    });
  });

  describe('assignments', () => {
    it('lists assignments for a member', async () => {
      const assignments = [{ id: 'a-1', description: 'Task 1' }];
      mockMembersRepository.listAssignments.mockResolvedValue(assignments);

      const result = await service.listAssignments('m-1');

      expect(result).toEqual(assignments);
      expect(repository.listAssignments).toHaveBeenCalledWith('m-1');
    });

    it('creates an assignment', async () => {
      mockMembersRepository.createAssignment.mockResolvedValue({ id: 'a-1' });

      const result = await service.createAssignment('m-1', {
        description: 'Assignment',
      } as never);

      expect(result).toEqual({ id: 'a-1' });
      expect(repository.createAssignment).toHaveBeenCalledWith('m-1', {
        description: 'Assignment',
      });
    });

    it('updates an assignment', async () => {
      mockMembersRepository.updateAssignment.mockResolvedValue({
        id: 'a-1',
        description: 'Updated',
      });

      const result = await service.updateAssignment('a-1', {
        description: 'Updated',
      });

      expect(result).toEqual({ id: 'a-1', description: 'Updated' });
      expect(repository.updateAssignment).toHaveBeenCalledWith('a-1', {
        description: 'Updated',
      });
    });
  });
});
