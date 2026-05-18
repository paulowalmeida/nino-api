import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanController } from './plan.controller'
import { PlanService } from './plan.service'

describe(PlanController.name, () => {
  let controller: PlanController
  let service: PlanService

  const mockPlan = {
    id: 'uuid-1',
    name: 'Pro',
    slug: 'pro',
    price: 99.9,
    maxTenants: 5,
    maxProducts: 100,
    maxOrders: 500,
    hasPrioritySupport: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: { name: 'BASIC' },
  }

  const mockService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [{ provide: PlanService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<PlanController>(PlanController)
    service = module.get<PlanService>(PlanService)
  })

  it('create() should create a plan', async () => {
    const dto: CreatePlanDto = {
      name: 'Pro',
      slug: 'pro',
      typeId: 'uuid-type-1',
      price: 99.9,
      maxTenants: 5,
      maxProducts: 100,
      maxOrders: 500,
    }
    mockService.create.mockResolvedValue(mockPlan)

    const result = await controller.create(dto)

    expect(result).toEqual(mockPlan)
    expect(service.create).toHaveBeenCalledWith(dto)
  })

  it('getAll() should return all plans', async () => {
    mockService.getAll.mockResolvedValue([mockPlan])

    const result = await controller.getAll()

    expect(result).toEqual([mockPlan])
    expect(service.getAll).toHaveBeenCalled()
  })

  it('getById() should return a plan by id', async () => {
    mockService.getById.mockResolvedValue(mockPlan)

    const result = await controller.getById('uuid-1')

    expect(result).toEqual(mockPlan)
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('update() should update a plan and return the updated entity', async () => {
    const dto: UpdatePlanDto = { name: 'New Pro' }
    mockService.update.mockResolvedValue(mockPlan)

    const result = await controller.update('uuid-1', dto)

    expect(service.update).toHaveBeenCalledWith('uuid-1', dto)
    expect(service.getById).not.toHaveBeenCalled()
    expect(result).toEqual(mockPlan)
  })

  it('delete() should delete a plan and return a success message', async () => {
    const deleteResponse = { message: 'Deleted successfully' }
    mockService.delete.mockResolvedValue(deleteResponse)

    const result = await controller.delete('uuid-1')

    expect(service.delete).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual(deleteResponse)
  })
})
