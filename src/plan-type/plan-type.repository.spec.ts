import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { PlanType } from '@plan-type/entities/plan-type.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { PlanTypeRepository } from './plan-type.repository'

describe(PlanTypeRepository.name, () => {
  let repository: PlanTypeRepository

  const mockPlanType = {
    id: 'uuid-1',
    name: 'MONTHLY',
    description: 'Monthly plan',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanTypeRepository,
        { provide: getRepositoryToken(PlanType), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<PlanTypeRepository>(PlanTypeRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return array', async () => {
    mockRepository.find.mockResolvedValue([mockPlanType])

    const result = await repository.getAll()

    expect(result).toEqual([mockPlanType])
    expect(mockRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } })
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return record by id', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockPlanType)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockPlanType)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' })
  })

  it('getById() should call errorService.handle with NotFoundException if not found', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getById('invalid-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('create() should create and return record', async () => {
    const createData = { name: 'ANNUAL', description: 'Annual plan' }
    mockRepository.findOneBy.mockResolvedValue(null)
    mockRepository.create.mockReturnValue(createData)
    mockRepository.save.mockResolvedValue(mockPlanType)

    const result = await repository.create(createData)

    expect(result).toEqual(mockPlanType)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('create() should call errorService.handle with ConflictException if name exists', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockPlanType)

    await repository.create({ name: 'MONTHLY' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('update() should update and return record', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockPlanType, ...updateData }
    mockRepository.findOneBy.mockResolvedValue(mockPlanType)
    mockRepository.save.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('update() should call errorService.handle with ConflictException if new name belongs to another', async () => {
    const another = { ...mockPlanType, id: 'uuid-2' }
    mockRepository.findOneBy
      .mockResolvedValueOnce(mockPlanType)
      .mockResolvedValueOnce(another)

    await repository.update('uuid-1', { name: 'ANNUAL' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('delete() should delete and return message', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockPlanType)
    mockRepository.delete.mockResolvedValue(undefined)

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Plan Type deleted successfully' })
    expect(mockRepository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockPlanType)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
