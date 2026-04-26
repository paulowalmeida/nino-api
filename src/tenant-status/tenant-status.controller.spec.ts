import { Test, TestingModule } from '@nestjs/testing'

import { TenantStatusController } from './tenant-status.controller'
import { TenantStatusService } from './tenant-status.service'

describe(TenantStatusController.name, () => {
  let controller: TenantStatusController
  let service: TenantStatusService

  const mockTenantStatus = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active tenant',
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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantStatusController],
      providers: [{ provide: TenantStatusService, useValue: mockService }],
    }).compile()

    controller = module.get<TenantStatusController>(TenantStatusController)
    service = module.get<TenantStatusService>(TenantStatusService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return tenant statuses array', async () => {
    mockService.getAll.mockResolvedValue([mockTenantStatus])

    const result = await controller.getAll()

    expect(result).toEqual([mockTenantStatus])
    expect(service.getAll).toHaveBeenCalled()
  })

  it('getById() should return tenant status by id', async () => {
    mockService.getById.mockResolvedValue(mockTenantStatus)

    const result = await controller.getById('uuid-1')

    expect(result).toEqual(mockTenantStatus)
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('create() should create a new tenant status', async () => {
    const createData = { name: 'SUSPENDED', description: 'Suspended' }
    mockService.create.mockResolvedValue({ ...mockTenantStatus, ...createData })

    const result = await controller.create(createData)

    expect(result.name).toBe('SUSPENDED')
    expect(service.create).toHaveBeenCalledWith(createData)
  })

  it('update() should update a tenant status', async () => {
    const updateData = { description: 'Updated' }
    mockService.update.mockResolvedValue({ ...mockTenantStatus, ...updateData })

    const result = await controller.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('delete() should delete a tenant status', async () => {
    mockService.delete.mockResolvedValue({
      message: 'TenantStatus deleted successfully',
    })

    const result = await controller.delete('uuid-1')

    expect(result).toEqual({ message: 'TenantStatus deleted successfully' })
    expect(service.delete).toHaveBeenCalledWith('uuid-1')
  })
})
