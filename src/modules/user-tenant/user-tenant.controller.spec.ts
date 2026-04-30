import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { UserTenantController } from './user-tenant.controller'
import { UserTenantService } from './user-tenant.service'

describe(UserTenantController.name, () => {
  let controller: UserTenantController
  let service: UserTenantService

  const mockUserTenantResponse = {
    tenantId: 'tenant-uuid-1',
    createdAt: new Date(),
    user: {
      id: 'user-uuid-1',
      name: 'Paulo',
      isActive: true,
      companyId: null,
      lastLoginAt: null,
      locale: null,
      timezone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: { name: 'OWNER' },
    },
  }

  const mockService = {
    create: jest.fn(),
    getByUserId: jest.fn(),
    getByTenantId: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTenantController],
      providers: [{ provide: UserTenantService, useValue: mockService }],
    }).compile()

    controller = module.get<UserTenantController>(UserTenantController)
    service = module.get<UserTenantService>(UserTenantService)
  })

  afterEach(() => jest.clearAllMocks())

  it('create() should return UserTenantResponse', async () => {
    mockService.create.mockResolvedValue(mockUserTenantResponse)

    const result = await controller.create({
      userId: 'user-uuid-1',
      tenantId: 'tenant-uuid-1',
    })

    expect(result).toEqual(mockUserTenantResponse)
    expect(service.create).toHaveBeenCalledWith({
      userId: 'user-uuid-1',
      tenantId: 'tenant-uuid-1',
    })
  })

  it('create() should propagate ConflictException from service', async () => {
    mockService.create.mockRejectedValue(
      new ConflictException('User is already linked to this tenant'),
    )

    await expect(
      controller.create({ userId: 'user-uuid-1', tenantId: 'tenant-uuid-1' }),
    ).rejects.toThrow(ConflictException)
  })

  it('getByUserId() should return paginated list', async () => {
    const paginated = { data: [mockUserTenantResponse], pagination: { page: 1, size: 20, total: 1, totalPages: 1, previousPage: null, nextPage: null } }
    mockService.getByUserId.mockResolvedValue(paginated)
    const query = { page: 1, size: 20 } as any

    const result = await controller.getByUserId('user-uuid-1', query)

    expect(result).toEqual(paginated)
    expect(service.getByUserId).toHaveBeenCalledWith('user-uuid-1', query)
  })

  it('getByTenantId() should return paginated list', async () => {
    const paginated = { data: [mockUserTenantResponse], pagination: { page: 1, size: 20, total: 1, totalPages: 1, previousPage: null, nextPage: null } }
    mockService.getByTenantId.mockResolvedValue(paginated)
    const query = { page: 1, size: 20 } as any

    const result = await controller.getByTenantId('tenant-uuid-1', query)

    expect(result).toEqual(paginated)
    expect(service.getByTenantId).toHaveBeenCalledWith('tenant-uuid-1', query)
  })

  it('delete() should return success message', async () => {
    mockService.delete.mockResolvedValue({
      message: 'UserTenant link removed successfully',
    })

    const result = await controller.delete('user-uuid-1', 'tenant-uuid-1')

    expect(result).toEqual({ message: 'UserTenant link removed successfully' })
    expect(service.delete).toHaveBeenCalledWith('user-uuid-1', 'tenant-uuid-1')
  })

  it('delete() should propagate NotFoundException from service', async () => {
    mockService.delete.mockRejectedValue(
      new NotFoundException('UserTenant link not found'),
    )

    await expect(
      controller.delete('user-uuid-1', 'tenant-uuid-1'),
    ).rejects.toThrow(NotFoundException)
  })
})
