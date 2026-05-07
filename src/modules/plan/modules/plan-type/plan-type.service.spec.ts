import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PlanTypeRepository } from './plan-type.repository'
import { PlanTypeService } from './plan-type.service'

describe(PlanTypeService.name, () => {
  let service: PlanTypeService
  let repository: PlanTypeRepository

  const mockPlanType = {
    id: 'uuid-1',
    name: 'MONTHLY',
    description: 'Monthly plan',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRepository = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanTypeService,
        { provide: PlanTypeRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<PlanTypeService>(PlanTypeService)
    repository = module.get<PlanTypeRepository>(PlanTypeRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return plan types array', async () => {
    mockRepository.getAll.mockResolvedValue([mockPlanType])
    const result = await service.getAll()
    expect(result).toEqual([mockPlanType])
    expect(repository.getAll).toHaveBeenCalled()
  })

  it('getById() should return plan type by id', async () => {
    mockRepository.getById.mockResolvedValue(mockPlanType)
    const result = await service.getById('uuid-1')
    expect(result).toEqual(mockPlanType)
    expect(repository.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockRepository.getById.mockRejectedValue(
      new NotFoundException('PlanType not found'),
    )
    await expect(service.getById('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should create new plan type', async () => {
    const createData = { name: 'ANNUAL', description: 'Annual plan' }
    mockRepository.create.mockResolvedValue({ ...mockPlanType, ...createData })
    const result = await service.create(createData)
    expect(result.name).toBe('ANNUAL')
    expect(repository.create).toHaveBeenCalledWith(createData)
  })

  it('create() should throw ConflictException if name exists', async () => {
    mockRepository.create.mockRejectedValue(
      new ConflictException('Name already exists'),
    )
    await expect(service.create({ name: 'MONTHLY' })).rejects.toThrow(
      ConflictException,
    )
  })

  it('update() should update plan type', async () => {
    const updateData = { description: 'Updated' }
    mockRepository.update.mockResolvedValue({ ...mockPlanType, ...updateData })
    const result = await service.update('uuid-1', updateData)
    expect(result.description).toBe('Updated')
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('update() should throw NotFoundException if missing', async () => {
    mockRepository.update.mockRejectedValue(
      new NotFoundException('PlanType not found'),
    )
    await expect(service.update('invalid-id', {})).rejects.toThrow(
      NotFoundException,
    )
  })

  it('update() should throw ConflictException if new name exists', async () => {
    mockRepository.update.mockRejectedValue(
      new ConflictException('Name already exists'),
    )
    await expect(service.update('uuid-1', { name: 'ANNUAL' })).rejects.toThrow(
      ConflictException,
    )
  })

  it('delete() should remove plan type', async () => {
    mockRepository.delete.mockResolvedValue({
      message: 'Plan Type deleted successfully',
    })
    const result = await service.delete('uuid-1')
    expect(result).toEqual({ message: 'Plan Type deleted successfully' })
    expect(repository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should throw NotFoundException if missing', async () => {
    mockRepository.delete.mockRejectedValue(
      new NotFoundException('PlanType not found'),
    )
    await expect(service.delete('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })
})
