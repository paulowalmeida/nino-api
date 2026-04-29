import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  const mockUser = { id: 'user-id', name: 'John Doe', roleId: 'role-id', companyId: 'company-id' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            getAll: jest.fn().mockResolvedValue({ data: [mockUser], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }),
            getById: jest.fn().mockResolvedValue(mockUser),
            getByCompanyId: jest.fn().mockResolvedValue([mockUser]),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should create a user', async () => {
    const dto = { name: 'John Doe', roleId: 'role-id' };
    const result = await service.create(dto);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockUser);
  });

  it('should get all users with pagination', async () => {
    const query = { page: 1, limit: 20 }
    const result = await service.getAll(query)
    expect(repository.getAll).toHaveBeenCalledWith(query)
    expect(result.data).toEqual([mockUser])
    expect(result.pagination.total).toBe(1)
  });

  it('should find a user by id', async () => {
    const result = await service.getById('user-id');
    expect(repository.getById).toHaveBeenCalledWith('user-id');
    expect(result).toEqual(mockUser);
  });

  it('should find users by companyId', async () => {
    const result = await service.getByCompanyId('company-id');
    expect(repository.getByCompanyId).toHaveBeenCalledWith('company-id');
    expect(result).toEqual([mockUser]);
  });

  it('should update a user', async () => {
    const dto = { name: 'Jane Doe' };
    await service.update('user-id', dto);
    expect(repository.update).toHaveBeenCalledWith('user-id', dto);
  });

  it('should delete a user', async () => {
    await service.delete('user-id');
    expect(repository.delete).toHaveBeenCalledWith('user-id');
  });
});