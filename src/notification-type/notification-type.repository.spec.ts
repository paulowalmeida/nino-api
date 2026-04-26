import { ConflictException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { NotificationTypeRepository } from './notification-type.repository'

describe(NotificationTypeRepository.name, () => {
  let repository: NotificationTypeRepository
  let prismaService: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockNotificationType = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active invoice',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrismaService = {
    notificationType: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockPrismaErrorService = {
    handleError: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTypeRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<NotificationTypeRepository>(NotificationTypeRepository)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return invoice statuses array', async () => {
    mockPrismaService.notificationType.findMany.mockResolvedValue([
      mockNotificationType,
    ])

    const result = await repository.getAll()

    expect(result).toEqual([mockNotificationType])
    expect(prismaService.notificationType.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    })
  })

  it('getAll() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.notificationType.findMany.mockRejectedValue(error)

    await repository.getAll()
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('getById() should return status by id', async () => {
    mockPrismaService.notificationType.findUnique.mockResolvedValue(
      mockNotificationType,
    )

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockNotificationType)
    expect(prismaService.notificationType.findUnique).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockPrismaService.notificationType.findUnique.mockResolvedValue(null)

    await expect(repository.getById('invalid-id'))
  })

  it('getById() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.notificationType.findUnique.mockRejectedValue(error)

    await repository.getById('uuid-1')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should create new invoice status', async () => {
    const createData = { name: 'SUSPENDED', description: 'Suspended invoice' }

    mockPrismaService.notificationType.findUnique.mockResolvedValue(null)
    mockPrismaService.notificationType.create.mockResolvedValue(mockNotificationType)

    const result = await repository.create(createData)

    expect(result).toEqual(mockNotificationType)
    expect(prismaService.notificationType.create).toHaveBeenCalledWith({
      data: createData,
    })
  })

  it('create() should call handleError on error', async () => {
    const error = new Error('DB error')
    const createData = { name: 'ACTIVE' }
    mockPrismaService.notificationType.create.mockRejectedValue(error)

    await repository.create(createData)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should throw ConflictException if name exists', async () => {
    mockPrismaService.notificationType.findUnique.mockResolvedValue(
      mockNotificationType,
    )

    await repository.create({ name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should update invoice status', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockNotificationType, ...updateData }
    mockPrismaService.notificationType.update.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(prismaService.notificationType.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: updateData,
    })
  })

  it('update() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.notificationType.update.mockRejectedValue(error)

    await repository.update('uuid-1', { name: 'NEW' })
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('update() should throw ConflictException if name exists', async () => {
    const another = { ...mockNotificationType, id: 'uuid-2' }
    mockPrismaService.notificationType.findUnique.mockResolvedValue(another)

    await repository.update('uuid-1', { name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('delete() should remove invoice status', async () => {
    mockPrismaService.notificationType.delete.mockResolvedValue({
      message: 'Notification Type deleted successfully',
    })

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Notification Type deleted successfully' })
    expect(prismaService.notificationType.delete).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('delete() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.notificationType.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })
})
