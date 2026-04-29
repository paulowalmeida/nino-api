import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUser = { id: 'user-id', name: 'John Doe', roleId: 'role-id', companyId: 'company-id' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
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

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should create a user', async () => {
    const dto = { name: 'John Doe', roleId: 'role-id' };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockUser);
  });

  it('should get all users with pagination', async () => {
    const query = { page: 1, limit: 20 }
    const result = await controller.getAll(query as any)
    expect(service.getAll).toHaveBeenCalledWith(query)
    expect(result.data).toEqual([mockUser])
    expect(result.pagination.total).toBe(1)
  });

  it('should find a user by id', async () => {
    const result = await controller.getById('user-id');
    expect(service.getById).toHaveBeenCalledWith('user-id');
    expect(result).toEqual(mockUser);
  });

  it('should find users by companyId', async () => {
    const result = await controller.getByCompanyId('company-id');
    expect(service.getByCompanyId).toHaveBeenCalledWith('company-id');
    expect(result).toEqual([mockUser]);
  });

  it('should update a user and return the updated entity', async () => {
    const dto = { name: 'Jane Doe' };
    const result = await controller.update('user-id', dto);
    expect(service.update).toHaveBeenCalledWith('user-id', dto);
    expect(service.getById).toHaveBeenCalledWith('user-id');
    expect(result).toEqual(mockUser);
  });

  it('should delete a user and return a success message', async () => {
    const result = await controller.delete('user-id');
    expect(service.delete).toHaveBeenCalledWith('user-id');
    expect(result).toEqual({ message: 'user deleted successfully' });
  });
});