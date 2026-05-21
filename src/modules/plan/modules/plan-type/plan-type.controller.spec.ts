import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CommonService } from '@shared/modules/common/common.service'
import { CommonEntity } from '@shared/modules/common/types/common-entity.type'

import { PlanTypeController } from './plan-type.controller'

describe(PlanTypeController.name, () => {
  let controller: PlanTypeController

  const mockPlanType: CommonEntity = {
    id: 'uuid-1',
    name: 'MONTHLY',
    description: 'Monthly plan',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockService: Pick<
    CommonService,
    'getAll' | 'getByField' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockPlanType]),
    getByField: jest.fn().mockResolvedValue(mockPlanType),
    create: jest.fn().mockResolvedValue(mockPlanType),
    update: jest.fn().mockResolvedValue(mockPlanType),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanTypeController],
      providers: [{ provide: CommonService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<PlanTypeController>(PlanTypeController)
  })

  it('getAll() should return plan types', async () => {
    const result = await controller.getAll({})
    expect(mockService.getAll).toHaveBeenCalledWith(undefined)
    expect(result).toEqual([mockPlanType])
  })

  it('getById() should return a plan type by id', async () => {
    const result = await controller.getById('uuid-1')
    expect(mockService.getByField).toHaveBeenCalledWith('id', 'uuid-1')
    expect(result).toEqual(mockPlanType)
  })

  it('create() should create a plan type', async () => {
    const dto = { name: 'ANNUAL', description: 'Annual plan' }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockPlanType)
  })

  it('update() should update a plan type', async () => {
    const dto = { description: 'Updated' }
    const result = await controller.update('uuid-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto)
    expect(result).toEqual(mockPlanType)
  })

  it('delete() should delete a plan type', async () => {
    const result = await controller.delete('uuid-1')
    expect(mockService.delete).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
