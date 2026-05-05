import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PdiService } from './pdi.service';
import { PdiRepository } from './pdi.repository';

describe('PdiService', () => {
  let service: PdiService;
  let repository: PdiRepository;

  const mockPdiRepository = {
    list: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    createRevision: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdiService,
        {
          provide: PdiRepository,
          useValue: mockPdiRepository,
        },
      ],
    }).compile();

    service = module.get<PdiService>(PdiService);
    repository = module.get<PdiRepository>(PdiRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('lists all entries without filter', async () => {
      const entries = [{ id: 'pdi-1' }];
      mockPdiRepository.list.mockResolvedValue(entries);

      const result = await service.list();

      expect(result).toEqual(entries);
      expect(repository.list).toHaveBeenCalledWith(undefined);
    });

    it('lists entries filtered by memberId', async () => {
      const entries = [{ id: 'pdi-1' }];
      mockPdiRepository.list.mockResolvedValue(entries);

      const result = await service.list('m-1');

      expect(result).toEqual(entries);
      expect(repository.list).toHaveBeenCalledWith('m-1');
    });
  });

  describe('getById', () => {
    it('returns entry when found', async () => {
      const entry = { id: 'pdi-1', title: 'Title', revisions: [] };
      mockPdiRepository.findById.mockResolvedValue(entry);

      const result = await service.getById('pdi-1');

      expect(result).toEqual(entry);
      expect(repository.findById).toHaveBeenCalledWith('pdi-1');
    });

    it('throws NotFoundException when entry is not found', async () => {
      mockPdiRepository.findById.mockResolvedValue(null);

      await expect(service.getById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates an entry', async () => {
      mockPdiRepository.create.mockResolvedValue({ id: 'pdi-1' });

      const result = await service.create({
        memberId: 'm-1',
        authorId: 'u-1',
        title: 'Title',
        content: 'Content',
      });

      expect(result).toEqual({ id: 'pdi-1' });
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates an entry with auto-revision', async () => {
      const updated = { id: 'pdi-1', title: 'New Title', content: 'New' };
      mockPdiRepository.update.mockResolvedValue(updated);

      const result = await service.update(
        'pdi-1',
        { title: 'New Title', content: 'New' },
        'editor-1',
      );

      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalledWith(
        'pdi-1',
        { title: 'New Title', content: 'New' },
        'editor-1',
      );
    });

    it('updates only isActive without content change', async () => {
      const updated = { id: 'pdi-1', isActive: false };
      mockPdiRepository.update.mockResolvedValue(updated);

      const result = await service.update(
        'pdi-1',
        { isActive: false },
        'editor-1',
      );

      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalledWith(
        'pdi-1',
        { isActive: false },
        'editor-1',
      );
    });
  });

  describe('createRevision', () => {
    it('creates a revision', async () => {
      mockPdiRepository.createRevision.mockResolvedValue({ id: 'rev-1' });

      const result = await service.createRevision('pdi-1', {
        editorId: 'u-1',
        content: 'Update',
      });

      expect(result).toEqual({ id: 'rev-1' });
      expect(repository.createRevision).toHaveBeenCalledWith('pdi-1', {
        editorId: 'u-1',
        content: 'Update',
      });
    });
  });
});
