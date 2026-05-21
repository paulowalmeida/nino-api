import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CommonService } from '@shared/modules/common/common.service'
import { CommonEntity } from '@shared/modules/common/types/common-entity.type'

import { OrderStatusController } from './order-status.controller'

describe(OrderStatusController.name, () => {
  let controller: OrderStatusController

  const mockEntity: CommonEntity = {
    id: 'status-1',
    name: 'PENDING',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockService: Pick<
    CommonService,
    'getAll' | 'getByField' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockEntity]),
    getByField: jest.fn().mockResolvedValue(mockEntity),
    create: jest.fn().mockResolvedValue(mockEntity),
    update: jest.fn().mockResolvedValue(mockEntity),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderStatusController],
      providers: [{ provide: CommonService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<OrderStatusController>(OrderStatusController)
  })

  it('getAll() should return all order statuses', async () => {
    const result = await controller.getAll()
    expect(mockService.getAll).toHaveBeenCalled()
    expect(result).toEqual([mockEntity])
  })

  it('getById() should return an order status by id', async () => {
    const result = await controller.getById('status-1')
    expect(mockService.getByField).toHaveBeenCalledWith('id', 'status-1')
    expect(result).toEqual(mockEntity)
  })

  it('create() should create an order status', async () => {
    const result = await controller.create({ name: 'PENDING' })
    expect(mockService.create).toHaveBeenCalledWith({ name: 'PENDING' })
    expect(result).toEqual(mockEntity)
  })

  it('update() should update an order status', async () => {
    const result = await controller.update('status-1', { name: 'CONFIRMED' })
    expect(mockService.update).toHaveBeenCalledWith('status-1', {
      name: 'CONFIRMED',
    })
    expect(result).toEqual(mockEntity)
  })

  it('delete() should delete an order status', async () => {
    const result = await controller.delete('status-1')
    expect(mockService.delete).toHaveBeenCalledWith('status-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
