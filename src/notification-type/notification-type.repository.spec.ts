import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { NotificationType } from '@notification-type/entities/notification-type.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { NotificationTypeRepository } from './notification-type.repository'

describe(NotificationTypeRepository.name, () => {
  let repository: NotificationTypeRepository

  const mockNotificationType = {
    id: 'uuid-1',
    name: 'EMAIL',
    description: 'Email notification',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTypeRepository,
        { provide: getRepositoryToken(NotificationType), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<NotificationTypeRepository>(NotificationTypeRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return array', async () => {
    mockRepository.find.mockResolvedValue([mockNotificationType])

    const result = await repository.getAll()

    expect(result).toEqual([mockNotificationType])
    expect(mockRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } })
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return record by id', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockNotificationType)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockNotificationType)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' })
  })

  it('getById() should call errorService.handle with NotFoundException if not found', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getById('invalid-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('create() should create and return record', async () => {
    const createData = { name: 'SMS', description: 'SMS notification' }
    mockRepository.findOneBy.mockResolvedValue(null)
    mockRepository.create.mockReturnValue(createData)
    mockRepository.save.mockResolvedValue(mockNotificationType)

    const result = await repository.create(createData)

    expect(result).toEqual(mockNotificationType)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('create() should call errorService.handle with ConflictException if name exists', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockNotificationType)

    await repository.create({ name: 'EMAIL' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('update() should update and return record', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockNotificationType, ...updateData }
    mockRepository.findOneBy.mockResolvedValue(mockNotificationType)
    mockRepository.save.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('update() should call errorService.handle with ConflictException if new name belongs to another', async () => {
    const another = { ...mockNotificationType, id: 'uuid-2' }
    mockRepository.findOneBy
      .mockResolvedValueOnce(mockNotificationType)
      .mockResolvedValueOnce(another)

    await repository.update('uuid-1', { name: 'SMS' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('delete() should delete and return message', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockNotificationType)
    mockRepository.delete.mockResolvedValue(undefined)

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Notification Type deleted successfully' })
    expect(mockRepository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockNotificationType)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
