import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { GlobalRoleController } from './global-role.controller'
import { GlobalRoleService } from './global-role.service'

describe(GlobalRoleController.name, () => {
  let controller: GlobalRoleController
  let service: GlobalRoleService

  const mockRole = {
    id: 'uuid-1',
    name: 'ADMIN',
    description: 'Administrator',
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
      controllers: [GlobalRoleController],
      providers: [{ provide: GlobalRoleService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<GlobalRoleController>(GlobalRoleController)
    service = module.get<GlobalRoleService>(GlobalRoleService)
  })

  afterEach(() => jest.clearAllMocks())

  it('getAll() should return an array of global roles', async () => {
    mockService.getAll.mockResolvedValue([mockRole])

    const result = await controller.getAll()

    expect(result).toEqual([mockRole])
    expect(service.getAll).toHaveBeenCalled()
  })

  it('getById() should return a global role by id', async () => {
    mockService.getById.mockResolvedValue(mockRole)

    const result = await controller.getById('uuid-1')

    expect(result).toEqual(mockRole)
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('create() should create a new global role', async () => {
    const createData = { name: 'SUPPORT', description: 'Support' }
    mockService.create.mockResolvedValue({ ...mockRole, ...createData })

    const result = await controller.create(createData)

    expect(result.name).toBe('SUPPORT')
    expect(service.create).toHaveBeenCalledWith(createData)
  })

  it('update() should update a global role', async () => {
    const updateData = { description: 'Updated' }
    mockService.update.mockResolvedValue({ ...mockRole, ...updateData })

    const result = await controller.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('delete() should delete a global role', async () => {
    mockService.delete.mockResolvedValue({
      message: 'GlobalRole deleted successfully',
    })

    const result = await controller.delete('uuid-1')

    expect(result).toEqual({ message: 'GlobalRole deleted successfully' })
    expect(service.delete).toHaveBeenCalledWith('uuid-1')
  })
})
