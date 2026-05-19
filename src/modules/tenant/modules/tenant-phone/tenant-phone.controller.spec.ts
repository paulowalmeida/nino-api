import { Test, TestingModule } from '@nestjs/testing'

import { TenantPhone } from '@prisma/client'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { TenantPhoneController } from './tenant-phone.controller'
import { TenantPhoneService } from './tenant-phone.service'

describe(TenantPhoneController.name, () => {
  let controller: TenantPhoneController

  const mockPhone: TenantPhone = {
    id: 'phone-1',
    phone: '11999999999',
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockService: Pick<
    TenantPhoneService,
    'getAll' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockPhone]),
    create: jest.fn().mockResolvedValue(mockPhone),
    update: jest.fn().mockResolvedValue(mockPhone),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantPhoneController],
      providers: [{ provide: TenantPhoneService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TenantPhoneController>(TenantPhoneController)
  })

  it('getAll() should return phones for tenant', async () => {
    const result = await controller.getAll('tenant-1')
    expect(mockService.getAll).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual([mockPhone])
  })

  it('create() should inject tenantId from param', async () => {
    const dto = { phone: '11999999999' }
    const result = await controller.create('tenant-1', dto)
    expect(mockService.create).toHaveBeenCalledWith({
      ...dto,
      tenantId: 'tenant-1',
    })
    expect(result).toEqual(mockPhone)
  })

  it('update() should update tenant phone', async () => {
    const dto = { phone: '11888888888' }
    const result = await controller.update('phone-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('phone-1', dto)
    expect(result).toEqual(mockPhone)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('phone-1')
    expect(mockService.delete).toHaveBeenCalledWith('phone-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
