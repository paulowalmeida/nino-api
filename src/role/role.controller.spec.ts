import { Test, TestingModule } from '@nestjs/testing'

import { RoleController } from './role.controller'
import { RoleService } from './role.service'

describe(RoleController.name, () => {
  let controller: RoleController
  let service: RoleService

  const mockRole = {
    id: 'uuid-1',
    name: 'ADMIN',
    description: 'Administrator',
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
      controllers: [RoleController],
      providers: [{ provide: RoleService, useValue: mockService }],
    }).compile()

    controller = module.get<RoleController>(RoleController)
    service = module.get<RoleService>(RoleService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return an array of roles', async () => {
    mockService.getAll.mockResolvedValue([mockRole])

    const result = await controller.getAll()

    expect(result).toEqual([mockRole])
    expect(service.getAll).toHaveBeenCalled()
  })

  it('getById() should return a role by id', async () => {
    mockService.getById.mockResolvedValue(mockRole)

    const result = await controller.getById('uuid-1')

    expect(result).toEqual(mockRole)
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('create() should create a new role', async () => {
    const createData = { name: 'MANAGER', description: 'Manager' }
    mockService.create.mockResolvedValue({ ...mockRole, ...createData })

    const result = await controller.create(createData)

    expect(result.name).toBe('MANAGER')
    expect(service.create).toHaveBeenCalledWith(createData)
  })

  it('update() should update a role', async () => {
    const updateData = { description: 'Updated' }
    mockService.update.mockResolvedValue({ ...mockRole, ...updateData })

    const result = await controller.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('delete() should delete a role', async () => {
    mockService.delete.mockResolvedValue({
      message: 'Role deleted successfully',
    })

    const result = await controller.delete('uuid-1')

    expect(result).toEqual({ message: 'Role deleted successfully' })
    expect(service.delete).toHaveBeenCalledWith('uuid-1')
  })
})
