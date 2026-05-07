import { Test, TestingModule } from '@nestjs/testing'

import { NotificationTypeController } from './notification-type.controller'
import { NotificationTypeService } from './notification-type.service'

describe(NotificationTypeController.name, () => {
  let controller: NotificationTypeController
  let service: NotificationTypeService

  const mockNotificationType = {
    id: 'uuid-1',
    name: 'EMAIL',
    description: 'Email notification',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationTypeController],
      providers: [{ provide: NotificationTypeService, useValue: mockService }],
    }).compile()

    controller = module.get<NotificationTypeController>(
      NotificationTypeController,
    )
    service = module.get<NotificationTypeService>(NotificationTypeService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return an array of notification types', async () => {
    mockService.getAll.mockResolvedValue([mockNotificationType])
    const result = await controller.getAll()
    expect(result).toEqual([mockNotificationType])
    expect(service.getAll).toHaveBeenCalled()
  })

  it('getById() should return a notification type by id', async () => {
    mockService.getById.mockResolvedValue(mockNotificationType)
    const result = await controller.getById('uuid-1')
    expect(result).toEqual(mockNotificationType)
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('create() should create a new notification type', async () => {
    const createData = { name: 'SMS', description: 'SMS notification' }
    mockService.create.mockResolvedValue({
      ...mockNotificationType,
      ...createData,
    })
    const result = await controller.create(createData)
    expect(result.name).toBe('SMS')
    expect(service.create).toHaveBeenCalledWith(createData)
  })

  it('update() should update a notification type', async () => {
    const updateData = { description: 'Updated' }
    mockService.update.mockResolvedValue({
      ...mockNotificationType,
      ...updateData,
    })
    const result = await controller.update('uuid-1', updateData)
    expect(result.description).toBe('Updated')
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('delete() should delete a notification type', async () => {
    mockService.delete.mockResolvedValue({
      message: 'NotificationType deleted successfully',
    })
    const result = await controller.delete('uuid-1')
    expect(result).toEqual({
      message: 'NotificationType deleted successfully',
    })
    expect(service.delete).toHaveBeenCalledWith('uuid-1')
  })
})
