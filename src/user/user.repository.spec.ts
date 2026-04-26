import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/services/prisma/prisma.service';
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: PrismaService;
  let prismaErrorService: PrismaErrorService;

  const mockUser = { id: 'user-id', name: 'John Doe', roleId: 'role-id', companyId: 'company-id' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: PrismaErrorService,
          useValue: { handleError: jest.fn() },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService);
  });

  it('should create a user successfully', async () => {
    jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser as any);
    const result = await repository.create({ name: 'John Doe', roleId: 'role-id' });
    expect(result).toEqual(mockUser);
  });

  it('should call handleError when create throws an error', async () => {
    const error = new Error('db error');
    jest.spyOn(prismaService.user, 'create').mockRejectedValue(error);
    await repository.create({ name: 'John Doe', roleId: 'role-id' });
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error);
  });

  it('should find a user by id', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
    const result = await repository.getById('user-id');
    expect(result).toEqual(mockUser);
  });

  it('should throw NotFoundException and call handleError when getById finds nothing', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
    await repository.getById('user-id');
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(expect.any(NotFoundException));
  });

  it('should find users by companyId', async () => {
    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([mockUser] as any);
    const result = await repository.getByCompanyId('company-id');
    expect(result).toEqual([mockUser]);
  });

  it('should call handleError when getByCompanyId throws an error', async () => {
    const error = new Error('db error');
    jest.spyOn(prismaService.user, 'findMany').mockRejectedValue(error);
    await repository.getByCompanyId('company-id');
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error);
  });

  it('should update a user successfully', async () => {
    jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser as any);
    await repository.update('user-id', { name: 'Jane Doe' });
    expect(prismaService.user.update).toHaveBeenCalled();
  });

  it('should call handleError when update throws an error', async () => {
    const error = new Error('db error');
    jest.spyOn(prismaService.user, 'update').mockRejectedValue(error);
    await repository.update('user-id', { name: 'Jane Doe' });
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error);
  });

  it('should delete a user successfully', async () => {
    jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser as any);
    await repository.delete('user-id');
    expect(prismaService.user.delete).toHaveBeenCalled();
  });

  it('should call handleError when delete throws an error', async () => {
    const error = new Error('db error');
    jest.spyOn(prismaService.user, 'delete').mockRejectedValue(error);
    await repository.delete('user-id');
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error);
  });
});