import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CommonService } from '@shared/modules/common/common.service'
import { CommonEntity } from '@shared/modules/common/types/common-entity.type'

import { TenantTypeController } from './tenant-type.controller'

describe(TenantTypeController.name, () => {
  let controller: TenantTypeController

  const mockEntity: CommonEntity = {
    id: 'uuid-1',
    name: 'TEST',
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
      controllers: [TenantTypeController],
      providers: [{ provide: CommonService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TenantTypeController>(TenantTypeController)
  })

  it('getAll() should return entities', async () => {
    const result = await controller.getAll({})
    expect(mockService.getAll).toHaveBeenCalledWith(undefined)
    expect(result).toEqual([mockEntity])
  })

  it('getById() should return entity by id', async () => {
    const result = await controller.getById('uuid-1')
    expect(mockService.getByField).toHaveBeenCalledWith('id', 'uuid-1')
    expect(result).toEqual(mockEntity)
  })

  it('create() should create entity', async () => {
    const dto = { name: 'NEW' }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockEntity)
  })

  it('update() should update entity', async () => {
    const dto = { description: 'Updated' }
    const result = await controller.update('uuid-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto)
    expect(result).toEqual(mockEntity)
  })

  it('delete() should delete entity', async () => {
    const result = await controller.delete('uuid-1')
    expect(mockService.delete).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
