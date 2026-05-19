import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { TenantPhone } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { TenantPhoneRepository } from './tenant-phone.repository'

describe(TenantPhoneRepository.name, () => {
  let repository: TenantPhoneRepository

  const mockPhone: TenantPhone = {
    id: 'phone-1',
    phone: '11999999999',
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    tenantPhone: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
        TenantPhoneRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<TenantPhoneRepository>(TenantPhoneRepository)
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return phones for a tenant', async () => {
    mockPrisma.tenantPhone.findMany.mockResolvedValue([mockPhone])
    const result = await repository.getAll('tenant-1')
    expect(result).toHaveLength(1)
    expect(result[0].tenantId).toBe('tenant-1')
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.tenantPhone.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll('tenant-1')).rejects.toThrow('db error')
  })

  it('getById() should return phone by id', async () => {
    mockPrisma.tenantPhone.findFirst.mockResolvedValue(mockPhone)
    const result = await repository.getById('phone-1')
    expect(result.id).toBe('phone-1')
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPrisma.tenantPhone.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should create a tenant phone', async () => {
    mockPrisma.tenantPhone.create.mockResolvedValue(mockPhone)
    const result = await repository.create({
      phone: '11999999999',
      tenantId: 'tenant-1',
    })
    expect(result.id).toBe('phone-1')
  })

  it('update() should update tenant phone', async () => {
    mockPrisma.tenantPhone.update.mockResolvedValue(mockPhone)
    const result = await repository.update('phone-1', { phone: '11888888888' })
    expect(result.id).toBe('phone-1')
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.tenantPhone.update.mockResolvedValue({})
    const result = await repository.delete('phone-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(mockPrisma.tenantPhone.update).toHaveBeenCalledWith({
      where: { id: 'phone-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.tenantPhone.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('phone-1')).rejects.toThrow('db error')
  })
})
