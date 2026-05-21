import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CommonService } from '@shared/modules/common/common.service'
import { CommonEntity } from '@shared/modules/common/types/common-entity.type'

import { TenantRoleController } from './tenant-role.controller'

describe(TenantRoleController.name, () => {
  let controller: TenantRoleController

  const mockRole: CommonEntity = {
    id: 'uuid-1',
    name: 'MANAGER',
    description: 'Tenant Manager',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockService: Pick<
    CommonService,
    'getAll' | 'getByField' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockRole]),
    getByField: jest.fn().mockResolvedValue(mockRole),
    create: jest.fn().mockResolvedValue(mockRole),
    update: jest.fn().mockResolvedValue(mockRole),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantRoleController],
      providers: [{ provide: CommonService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TenantRoleController>(TenantRoleController)
  })

  it('getAll() should return tenant roles', async () => {
    const result = await controller.getAll()
    expect(mockService.getAll).toHaveBeenCalledWith()
    expect(result).toEqual([mockRole])
  })

  it('getById() should return a tenant role by id', async () => {
    const result = await controller.getById('uuid-1')
    expect(mockService.getByField).toHaveBeenCalledWith('id', 'uuid-1')
    expect(result).toEqual(mockRole)
  })

  it('create() should create a tenant role', async () => {
    const dto = { name: 'CASHIER', description: 'Cashier' }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockRole)
  })

  it('update() should update a tenant role', async () => {
    const dto = { description: 'Updated' }
    const result = await controller.update('uuid-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto)
    expect(result).toEqual(mockRole)
  })

  it('delete() should delete a tenant role', async () => {
    const result = await controller.delete('uuid-1')
    expect(mockService.delete).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
