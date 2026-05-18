import { Test, TestingModule } from '@nestjs/testing'

import { TenantType } from '@prisma/client'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateTenantTypeDto } from './dtos/create-tenant-type.dto'
import { UpdateTenantTypeDto } from './dtos/update-tenant-type.dto'
import { TenantTypeController } from './tenant-type.controller'
import { TenantTypeService } from './tenant-type.service'

describe(TenantTypeController.name, () => {
  let controller: TenantTypeController
  let service: TenantTypeService

  const mockRecord: Omit<TenantType, 'deletedAt'> = {
    id: 'uuid-1',
    name: 'RESIDENTIAL',
    description: 'Residential tenant',
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
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantTypeController],
      providers: [{ provide: TenantTypeService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TenantTypeController>(TenantTypeController)
    service = module.get<TenantTypeService>(TenantTypeService)
  })

  it('getAll() should return all tenant types', async () => {
    mockService.getAll.mockResolvedValue([mockRecord])
    const result = await controller.getAll()
    expect(service.getAll).toHaveBeenCalled()
    expect(result).toEqual([mockRecord])
  })

  it('getById() should return tenant type by id', async () => {
    mockService.getById.mockResolvedValue(mockRecord)
    const result = await controller.getById('uuid-1')
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual(mockRecord)
  })

  it('create() should create and return tenant type', async () => {
    const dto: CreateTenantTypeDto = { name: 'COMMERCIAL', description: 'x' }
    mockService.create.mockResolvedValue({ ...mockRecord, ...dto })
    const result = await controller.create(dto)
    expect(service.create).toHaveBeenCalledWith(dto)
    expect(result.name).toBe('COMMERCIAL')
  })

  it('update() should update and return tenant type', async () => {
    const dto: UpdateTenantTypeDto = { description: 'Updated' }
    const updated = { ...mockRecord, ...dto }
    mockService.update.mockResolvedValue(updated)
    const result = await controller.update('uuid-1', dto)
    expect(service.update).toHaveBeenCalledWith('uuid-1', dto)
    expect(result).toEqual(updated)
  })

  it('delete() should delete and return success message', async () => {
    const deleteResponse = { message: 'Deleted successfully' }
    mockService.delete.mockResolvedValue(deleteResponse)
    const result = await controller.delete('uuid-1')
    expect(service.delete).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual(deleteResponse)
  })
})
