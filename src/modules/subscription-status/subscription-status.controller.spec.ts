import { Test, TestingModule } from '@nestjs/testing'

import { SubscriptionStatusController } from './subscription-status.controller'
import { SubscriptionStatusService } from './subscription-status.service'

describe(SubscriptionStatusController.name, () => {
  let controller: SubscriptionStatusController
  let service: SubscriptionStatusService

  const mockSubscriptionStatus = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active subscription',
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
      controllers: [SubscriptionStatusController],
      providers: [
        { provide: SubscriptionStatusService, useValue: mockService },
      ],
    }).compile()

    controller = module.get<SubscriptionStatusController>(
      SubscriptionStatusController,
    )
    service = module.get<SubscriptionStatusService>(SubscriptionStatusService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return an array of subscription statuses', async () => {
    mockService.getAll.mockResolvedValue([mockSubscriptionStatus])

    const result = await controller.getAll()

    expect(result).toEqual([mockSubscriptionStatus])
    expect(service.getAll).toHaveBeenCalled()
  })

  it('getById() should return a subscription status by id', async () => {
    mockService.getById.mockResolvedValue(mockSubscriptionStatus)

    const result = await controller.getById('uuid-1')

    expect(result).toEqual(mockSubscriptionStatus)
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('create() should create a new subscription status', async () => {
    const createData = { name: 'SUSPENDED', description: 'Suspended' }
    mockService.create.mockResolvedValue({
      ...mockSubscriptionStatus,
      ...createData,
    })

    const result = await controller.create(createData)

    expect(result.name).toBe('SUSPENDED')
    expect(service.create).toHaveBeenCalledWith(createData)
  })

  it('update() should update a subscription status', async () => {
    const updateData = { description: 'Updated' }
    mockService.update.mockResolvedValue({
      ...mockSubscriptionStatus,
      ...updateData,
    })

    const result = await controller.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('delete() should delete a subscription status', async () => {
    mockService.delete.mockResolvedValue({
      message: 'SubscriptionStatus deleted successfully',
    })

    const result = await controller.delete('uuid-1')

    expect(result).toEqual({
      message: 'SubscriptionStatus deleted successfully',
    })
    expect(service.delete).toHaveBeenCalledWith('uuid-1')
  })
})
