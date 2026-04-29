import { Test, TestingModule } from '@nestjs/testing'

import { PlanController } from './plan.controller'
import { PlanService } from './plan.service'

describe('PlanController', () => {
  let controller: PlanController
  let service: PlanService

  const mockPlan = { id: 1, name: 'Pro', slug: 'pro' }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [
        {
          provide: PlanService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockPlan),
            getAll: jest.fn().mockResolvedValue([mockPlan]),
            getById: jest.fn().mockResolvedValue(mockPlan),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile()

    controller = module.get<PlanController>(PlanController)
    service = module.get<PlanService>(PlanService)
  })

  it('should create a plan', async () => {
    const dto = { name: 'Pro' } as any
    const result = await controller.create(dto)
    expect(service.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockPlan)
  })

  it('should find all plans', async () => {
    const result = await controller.getAll()
    expect(service.getAll).toHaveBeenCalled()
    expect(result).toEqual([mockPlan])
  })

  it('should find a plan by id', async () => {
    const result = await controller.getById(1)
    expect(service.getById).toHaveBeenCalledWith(1)
    expect(result).toEqual(mockPlan)
  })

  it('should update a plan and return the updated entity', async () => {
    const dto = { name: 'New Pro' }
    const result = await controller.update(1, dto)
    expect(service.update).toHaveBeenCalledWith(1, dto)
    expect(service.getById).toHaveBeenCalledWith(1)
    expect(result).toEqual(mockPlan)
  })

  it('should delete a plan and return a success message', async () => {
    const result = await controller.delete(1)
    expect(service.delete).toHaveBeenCalledWith(1)
    expect(result).toEqual({ message: 'plan deleted successfully' })
  })
})
