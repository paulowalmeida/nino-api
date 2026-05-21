import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { UserController } from './user.controller'
import { UserService } from './user.service'
import { UserResponse } from './types/user-response.type'

describe(UserController.name, () => {
  let controller: UserController

  const mockUser = {
    id: 'user-id',
    name: 'John Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: { id: 'role-id', name: 'ADMIN' },
    credentials: [],
  } as unknown as UserResponse

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockService: Pick<
    UserService,
    'create' | 'getAll' | 'getById' | 'getByCompanyId' | 'update' | 'delete'
  > = {
    create: jest.fn().mockResolvedValue(mockUser),
    getAll: jest
      .fn()
      .mockResolvedValue({ data: [mockUser], pagination: mockMeta }),
    getById: jest.fn().mockResolvedValue(mockUser),
    getByCompanyId: jest.fn().mockResolvedValue([mockUser]),
    update: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<UserController>(UserController)
  })

  it('create() should create a user', async () => {
    const dto = { name: 'John Doe', globalRoleId: 'role-id' }
    const result = await controller.create(dto as never)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockUser)
  })

  it('getAll() should return paginated users', async () => {
    const query = { page: 1, size: 10, orderBy: 'name' }
    const result = await controller.getAll(query as never)
    expect(mockService.getAll).toHaveBeenCalledWith(query)
    expect(result.data).toEqual([mockUser])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should return a user by id', async () => {
    const result = await controller.getById('user-id')
    expect(mockService.getById).toHaveBeenCalledWith('user-id')
    expect(result).toEqual(mockUser)
  })

  it('getByCompanyId() should return users by companyId', async () => {
    const result = await controller.getByCompanyId('company-id')
    expect(mockService.getByCompanyId).toHaveBeenCalledWith('company-id')
    expect(result).toEqual([mockUser])
  })

  it('update() should update and return UserResponse', async () => {
    const dto = { name: 'Jane Doe' }
    const result = await controller.update('user-id', dto as never)
    expect(mockService.update).toHaveBeenCalledWith('user-id', dto)
    expect(result).toEqual(mockUser)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('user-id')
    expect(mockService.delete).toHaveBeenCalledWith('user-id')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
