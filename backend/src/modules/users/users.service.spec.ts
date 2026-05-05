import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUsersRepository = {
    findMany: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    updateRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return a paginated list of users', async () => {
      const users = [{ id: '1', name: 'User 1' }];
      mockUsersRepository.findMany.mockResolvedValue(users);

      const result = await service.list({});
      
      expect(result).toEqual({ items: users });
      expect(repository.findMany).toHaveBeenCalledWith({
        role: undefined,
        status: undefined,
        q: undefined,
        cursor: undefined,
        limit: 20,
      });
    });
  });

  describe('getById', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', name: 'User 1' };
      mockUsersRepository.findById.mockResolvedValue(user);

      const result = await service.getById('1');
      
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.getById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update user status', async () => {
      const updatedUser = { id: '1', status: 'APPROVED' };
      mockUsersRepository.updateStatus.mockResolvedValue(updatedUser);

      const result = await service.updateStatus('1', 'APPROVED');
      
      expect(result).toEqual(updatedUser);
      expect(repository.updateStatus).toHaveBeenCalledWith('1', 'APPROVED');
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const updatedUser = { id: '1', role: 'ADMIN' };
      mockUsersRepository.updateRole.mockResolvedValue(updatedUser);

      const result = await service.updateRole('1', 'ADMIN');
      
      expect(result).toEqual(updatedUser);
      expect(repository.updateRole).toHaveBeenCalledWith('1', 'ADMIN');
    });
  });
});
