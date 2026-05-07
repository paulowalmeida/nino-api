import { Test, TestingModule } from '@nestjs/testing'

import { PlanTypeController } from './plan-type.controller'
import { PlanTypeService } from './plan-type.service'

describe(PlanTypeController.name, () => {
  let controller: PlanTypeController
  let service: PlanTypeService

  const mockPlanType = {
    id: 'uuid-1',
    name: 'MONTHLY',
    description: 'Monthly plan',
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
      controllers: [PlanTypeController],
      providers: [{ provide: PlanTypeService, useValue: mockService }],
    }).compile()

    controller = module.get<PlanTypeController>(PlanTypeController)
    service = module.get<PlanTypeService>(PlanTypeService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return an array of plan types', async () => {
    mockService.getAll.mockResolvedValue([mockPlanType])
    const result = await controller.getAll()
    expect(result).toEqual([mockPlanType])
    expect(service.getAll).toHaveBeenCalled()
  })

  it('getById() should return a plan type by id', async () => {
    mockService.getById.mockResolvedValue(mockPlanType)
    const result = await controller.getById('uuid-1')
    expect(result).toEqual(mockPlanType)
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('create() should create a new plan type', async () => {
    const createData = { name: 'ANNUAL', description: 'Annual plan' }
    mockService.create.mockResolvedValue({ ...mockPlanType, ...createData })
    const result = await controller.create(createData)
    expect(result.name).toBe('ANNUAL')
    expect(service.create).toHaveBeenCalledWith(createData)
  })

  it('update() should update a plan type', async () => {
    const updateData = { description: 'Updated' }
    mockService.update.mockResolvedValue({ ...mockPlanType, ...updateData })
    const result = await controller.update('uuid-1', updateData)
    expect(result.description).toBe('Updated')
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('delete() should delete a plan type', async () => {
    mockService.delete.mockResolvedValue({
      message: 'Plan Type deleted successfully',
    })
    const result = await controller.delete('uuid-1')
    expect(result).toEqual({ message: 'Plan Type deleted successfully' })
    expect(service.delete).toHaveBeenCalledWith('uuid-1')
  })
})
