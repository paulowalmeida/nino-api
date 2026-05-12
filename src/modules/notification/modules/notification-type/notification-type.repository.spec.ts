import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { NotificationType } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { NotificationTypeRepository } from './notification-type.repository'

describe(NotificationTypeRepository.name, () => {
  let repository: NotificationTypeRepository

  const mockRecord: NotificationType = {
    id: 'uuid-1',
    name: 'EMAIL',
    description: 'Email notification',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    notificationType: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => { throw e }),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation((e: unknown): never => { throw e as never })
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTypeRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<NotificationTypeRepository>(NotificationTypeRepository)
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return array', async () => {
    mockPrisma.notificationType.findMany.mockResolvedValue([mockRecord])
    expect(await repository.getAll()).toEqual([mockRecord])
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.notificationType.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll()).rejects.toThrow('db error')
  })

  it('getById() should return record by id', async () => {
    mockPrisma.notificationType.findFirst.mockResolvedValue(mockRecord)
    expect(await repository.getById('uuid-1')).toEqual(mockRecord)
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPrisma.notificationType.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid-id')).rejects.toThrow(NotFoundException)
  })

  it('create() should create and return record', async () => {
    mockPrisma.notificationType.create.mockResolvedValue(mockRecord)
    expect(await repository.create({ name: 'SMS', description: 'SMS' })).toEqual(mockRecord)
  })

  it('create() should throw on db error', async () => {
    mockPrisma.notificationType.create.mockRejectedValue(new Error('db error'))
    await expect(repository.create({ name: 'SMS' })).rejects.toThrow('db error')
  })

  it('update() should update and return record', async () => {
    const updated = { ...mockRecord, description: 'Updated' }
    mockPrisma.notificationType.update.mockResolvedValue(updated)
    expect(await repository.update('uuid-1', { description: 'Updated' })).toEqual(updated)
  })

  it('update() should throw on db error', async () => {
    mockPrisma.notificationType.update.mockRejectedValue(new Error('db error'))
    await expect(repository.update('uuid-1', { description: 'x' })).rejects.toThrow('db error')
  })

  it('delete() should soft delete and return message', async () => {
    mockPrisma.notificationType.update.mockResolvedValue({})
    expect(await repository.delete('uuid-1')).toEqual({ message: 'Deleted successfully' })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.notificationType.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('uuid-1')).rejects.toThrow('db error')
  })
})
