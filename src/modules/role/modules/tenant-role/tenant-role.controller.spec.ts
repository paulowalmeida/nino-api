import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { TenantRoleController } from './tenant-role.controller'
import { TenantRoleService } from './tenant-role.service'

describe(TenantRoleController.name, () => {
  let controller: TenantRoleController
  let service: TenantRoleService

  const mockRole = {
    id: 'uuid-1',
    name: 'MANAGER',
    description: 'Tenant Manager',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantRoleController],
      providers: [{ provide: TenantRoleService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TenantRoleController>(TenantRoleController)
    service = module.get<TenantRoleService>(TenantRoleService)
  })

  afterEach(() => jest.clearAllMocks())

  it('getAll() should return an array of tenant roles', async () => {
    mockService.getAll.mockResolvedValue([mockRole])

    const result = await controller.getAll()

    expect(result).toEqual([mockRole])
    expect(service.getAll).toHaveBeenCalled()
  })

  it('getById() should return a tenant role by id', async () => {
    mockService.getById.mockResolvedValue(mockRole)

    const result = await controller.getById('uuid-1')

    expect(result).toEqual(mockRole)
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('create() should create a new tenant role', async () => {
    const createData = { name: 'CASHIER', description: 'Cashier' }
    mockService.create.mockResolvedValue({ ...mockRole, ...createData })

    const result = await controller.create(createData)

    expect(result.name).toBe('CASHIER')
    expect(service.create).toHaveBeenCalledWith(createData)
  })

  it('update() should update a tenant role', async () => {
    const updateData = { description: 'Updated' }
    mockService.update.mockResolvedValue({ ...mockRole, ...updateData })

    const result = await controller.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('delete() should delete a tenant role', async () => {
    mockService.delete.mockResolvedValue({
      message: 'TenantRole deleted successfully',
    })

    const result = await controller.delete('uuid-1')

    expect(result).toEqual({ message: 'TenantRole deleted successfully' })
    expect(service.delete).toHaveBeenCalledWith('uuid-1')
  })
})
