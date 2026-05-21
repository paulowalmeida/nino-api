import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CommonService } from '@shared/modules/common/common.service'
import { CommonEntity } from '@shared/modules/common/types/common-entity.type'

import { TenantStatusController } from './tenant-status.controller'

describe(TenantStatusController.name, () => {
  let controller: TenantStatusController

  const mockStatus: CommonEntity = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockService: Pick<
    CommonService,
    'getAll' | 'getByField' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockStatus]),
    getByField: jest.fn().mockResolvedValue(mockStatus),
    create: jest.fn().mockResolvedValue(mockStatus),
    update: jest.fn().mockResolvedValue(mockStatus),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantStatusController],
      providers: [{ provide: CommonService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TenantStatusController>(TenantStatusController)
  })

  it('getAll() should return tenant statuses', async () => {
    const result = await controller.getAll({})
    expect(mockService.getAll).toHaveBeenCalledWith(undefined)
    expect(result).toEqual([mockStatus])
  })

  it('getById() should return a tenant status by id', async () => {
    const result = await controller.getById('uuid-1')
    expect(mockService.getByField).toHaveBeenCalledWith('id', 'uuid-1')
    expect(result).toEqual(mockStatus)
  })

  it('create() should create a tenant status', async () => {
    const dto = { name: 'INACTIVE', description: 'Inactive tenant' }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockStatus)
  })

  it('update() should update a tenant status', async () => {
    const dto = { description: 'Updated' }
    const result = await controller.update('uuid-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto)
    expect(result).toEqual(mockStatus)
  })

  it('delete() should delete a tenant status', async () => {
    const result = await controller.delete('uuid-1')
    expect(mockService.delete).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
