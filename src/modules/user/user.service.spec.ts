import { Test, TestingModule } from '@nestjs/testing'

import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { UserRepository } from './user.repository'
import { UserService } from './user.service'
import { CreateUserDto } from './dtos/create-user.dto'
import { UserFull } from './types/user-full.type'
import { UserResponse } from './types/user-response.type'

describe(UserService.name, () => {
  let service: UserService

  const createdAt = new Date()
  const updatedAt = new Date()

  const mockUserFull = {
    id: 'user-id',
    name: 'John Doe',
    phone: null,
    isActive: true,
    lastLoginAt: null,
    locale: null,
    timezone: null,
    globalRoleId: 'role-id',
    createdAt,
    updatedAt,
    deletedAt: null,
    globalRole: { id: 'role-id', name: 'ADMIN' },
    credentials: [],
  } as unknown as UserFull

  const mockUserResponse = {
    id: 'user-id',
    name: 'John Doe',
    phone: null,
    isActive: true,
    lastLoginAt: null,
    locale: null,
    timezone: null,
    createdAt,
    updatedAt,
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

  const mockRepo: Pick<
    UserRepository,
    'findAllPaginated' | 'findAll' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest
      .fn()
      .mockResolvedValue({ data: [mockUserFull], pagination: mockMeta }),
    findAll: jest.fn().mockResolvedValue([mockUserFull]),
    findItem: jest.fn().mockResolvedValue(mockUserFull),
    insert: jest.fn().mockResolvedValue(mockUserFull),
    updateItem: jest.fn().mockResolvedValue(mockUserFull),
    softDelete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('create() should insert and return mapped UserResponse', async () => {
    const dto: CreateUserDto = { name: 'John Doe', globalRoleId: 'role-id' }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: dto,
      include: { globalRole: true, credentials: true },
    })
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
    expect((result as Record<string, unknown>).globalRoleId).toBeUndefined()
  })

  it('getAll() should return paginated mapped UserResponse', async () => {
    const query = { page: 1, size: 10, orderBy: 'name' }
    const result = await service.getAll(query as never)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { target: 'name', direction: 'asc' },
        page: 1,
        size: 10,
      }),
    )
    expect(result.pagination).toEqual(mockMeta)
    expect((result.data[0] as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('getById() should return mapped UserResponse', async () => {
    const result = await service.getById('user-id')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      include: { globalRole: true, credentials: true },
    })
    expect((result as Record<string, unknown>).globalRoleId).toBeUndefined()
  })

  it('getByCompanyId() should return mapped UserResponse[]', async () => {
    const result = await service.getByCompanyId('company-id')
    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userTenants: { some: { tenant: { companyId: 'company-id' } } } },
      }),
    )
    expect(result).toHaveLength(1)
    expect((result[0] as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('update() should updateItem and return mapped UserResponse', async () => {
    const result = await service.update('user-id', { name: 'Jane' })
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { name: 'Jane' },
      include: { globalRole: true, credentials: true },
    })
    expect(result).toEqual(mockUserResponse)
  })

  it('delete() should call softDelete with id object', async () => {
    const result = await service.delete('user-id')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'user-id' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
