import { Test, TestingModule } from '@nestjs/testing'

import { Plan } from '@prisma/client'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanController } from './plan.controller'
import { PlanService } from './plan.service'
import { PlanResponse } from './types/plan.response.type'

describe(PlanController.name, () => {
  let controller: PlanController

  const mockPlan: PlanResponse = {
    id: 'uuid-1',
    name: 'Pro',
    slug: 'pro',
    price: 99.9 as unknown as Plan['price'],
    maxTenants: 5,
    maxProducts: 100,
    maxOrders: 500,
    hasPrioritySupport: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: { name: 'BASIC' },
  }

  const mockService: Pick<
    PlanService,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    create: jest.fn().mockResolvedValue(mockPlan),
    getAll: jest.fn().mockResolvedValue([mockPlan]),
    getById: jest.fn().mockResolvedValue(mockPlan),
    update: jest.fn().mockResolvedValue(mockPlan),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
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
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockPlan)
  })

  it('getAll() should return all plans', async () => {
    const result = await controller.getAll()
    expect(mockService.getAll).toHaveBeenCalled()
    expect(result).toEqual([mockPlan])
  })

  it('getById() should return a plan by id', async () => {
    const result = await controller.getById('uuid-1')
    expect(mockService.getById).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual(mockPlan)
  })

  it('update() should update a plan and return the updated entity', async () => {
    const dto: UpdatePlanDto = { name: 'New Pro' }
    const result = await controller.update('uuid-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto)
    expect(result).toEqual(mockPlan)
  })

  it('delete() should delete a plan and return a success message', async () => {
    const result = await controller.delete('uuid-1')
    expect(mockService.delete).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
