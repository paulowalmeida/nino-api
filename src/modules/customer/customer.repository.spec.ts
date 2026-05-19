import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CustomerRepository } from './customer.repository'
import { CustomerFull } from './types/customer-full.type'

describe(CustomerRepository.name, () => {
  let repository: CustomerRepository

  const mockUser = {
    id: 'user-1',
    name: 'João',
    phone: '11999999999',
    globalRoleId: 'role-1',
    isActive: true,
    lastLoginAt: null,
    locale: null,
    timezone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockCustomerFull: CustomerFull = {
    id: 'customer-1',
    userId: 'user-1',
    cpf: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    user: mockUser,
  }

  const mockPrisma = {
    customer: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  }

  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest
      .fn<never, [unknown, string?]>()
      .mockImplementation((e) => { throw e }),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation(
      (e: unknown): never => { throw e as never },
    )
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<CustomerRepository>(CustomerRepository)
    mockPrisma.customer.count.mockResolvedValue(0)
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return paginated CustomerResponse', async () => {
    mockPrisma.customer.findMany.mockResolvedValue([mockCustomerFull])
    mockPrisma.customer.count.mockResolvedValue(1)
    const result = await repository.getAll({ page: 1, size: 10 })
    expect(result.data).toHaveLength(1)
    expect(result.pagination.total).toBe(1)
    expect(result.data[0].user).toEqual({ name: 'João', phone: '11999999999' })
    expect(
      (result.data[0] as Record<string, unknown>).userId,
    ).toBeUndefined()
    expect(
      (result.data[0] as Record<string, unknown>).deletedAt,
    ).toBeUndefined()
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.customer.findMany.mockRejectedValue(new Error('db error'))
    await expect(
      repository.getAll({ page: 1, size: 10 }),
    ).rejects.toThrow('db error')
  })

  it('getById() should return CustomerResponse without FK fields', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue(mockCustomerFull)
    const result = await repository.getById('customer-1')
    expect(result.id).toBe('customer-1')
    expect(result.user).toEqual({ name: 'João', phone: '11999999999' })
    expect((result as Record<string, unknown>).userId).toBeUndefined()
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should create and return CustomerResponse', async () => {
    mockPrisma.customer.create.mockResolvedValue(mockCustomerFull)
    const result = await repository.create({ userId: 'user-1' })
    expect(result.id).toBe('customer-1')
    expect(result.user).toEqual({ name: 'João', phone: '11999999999' })
    expect((result as Record<string, unknown>).userId).toBeUndefined()
  })

  it('create() should throw on db error', async () => {
    mockPrisma.customer.create.mockRejectedValue(new Error('db error'))
    await expect(repository.create({ userId: 'user-1' })).rejects.toThrow(
      'db error',
    )
  })

  it('update() should update and return CustomerResponse', async () => {
    mockPrisma.customer.update.mockResolvedValue(mockCustomerFull)
    const result = await repository.update('customer-1', { cpf: '12345678900' })
    expect(result.id).toBe('customer-1')
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('update() should throw on db error', async () => {
    mockPrisma.customer.update.mockRejectedValue(new Error('db error'))
    await expect(
      repository.update('customer-1', { cpf: '12345678900' }),
    ).rejects.toThrow('db error')
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.customer.update.mockResolvedValue({})
    const result = await repository.delete('customer-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(mockPrisma.customer.update).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.customer.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('customer-1')).rejects.toThrow('db error')
  })
})
