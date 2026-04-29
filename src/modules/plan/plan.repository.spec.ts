import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { Plan } from './entities/plan.entity'
import { PlanRepository } from './plan.repository'

describe('PlanRepository', () => {
  let repository: PlanRepository

  const mockPlanRaw = { id: 1, name: 'Pro', slug: 'pro', price: 197, typeId: 'type-1', type: { name: 'monthly' } }
  const mockPlanResponse = { id: 1, name: 'Pro', slug: 'pro', price: 197, type: { name: 'monthly' } }

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanRepository,
        { provide: getRepositoryToken(Plan), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<PlanRepository>(PlanRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a plan successfully', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)
    mockRepository.create.mockReturnValue(mockPlanRaw)
    mockRepository.save.mockResolvedValue(mockPlanRaw)
    mockRepository.findOne.mockResolvedValue(mockPlanRaw)

    const result = await repository.create({ name: 'Pro', slug: 'pro' } as any)

    expect(result).toEqual(mockPlanResponse)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle with ConflictException if slug exists', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockPlanRaw)

    await repository.create({ name: 'Pro', slug: 'pro' } as any)

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('should call errorService.handle when create throws', async () => {
    const error = new Error('db error')
    mockRepository.findOneBy.mockResolvedValue(null)
    mockRepository.create.mockReturnValue({})
    mockRepository.save.mockRejectedValue(error)

    await repository.create({ name: 'Pro', slug: 'pro' } as any)

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should find all plans', async () => {
    mockRepository.find.mockResolvedValue([mockPlanRaw])

    const result = await repository.getAll()

    expect(result).toEqual([mockPlanResponse])
    expect(mockRepository.find).toHaveBeenCalledWith({
      order: { name: 'ASC' },
      relations: ['type'],
    })
  })

  it('should call errorService.handle when getAll throws', async () => {
    const error = new Error('db error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should find a plan by id', async () => {
    mockRepository.findOne.mockResolvedValue(mockPlanRaw)

    const result = await repository.getById(1)

    expect(result).toEqual(mockPlanResponse)
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['type'] })
  })

  it('should call errorService.handle with NotFoundException when getById finds nothing', async () => {
    mockRepository.findOne.mockResolvedValue(null)

    await repository.getById(1)

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should update a plan successfully', async () => {
    mockRepository.findOne.mockResolvedValue(mockPlanRaw)
    mockRepository.save.mockResolvedValue(undefined)

    await repository.update(1, { name: 'New Pro' })

    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle with ConflictException if new slug exists in another plan', async () => {
    const anotherPlan = { ...mockPlanRaw, id: 2, slug: 'enterprise' }
    mockRepository.findOne.mockResolvedValue(mockPlanRaw)
    mockRepository.findOneBy.mockResolvedValue(anotherPlan)

    await repository.update(1, { slug: 'enterprise' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('should allow update when slug is unchanged', async () => {
    mockRepository.findOne.mockResolvedValue(mockPlanRaw)
    mockRepository.save.mockResolvedValue(undefined)

    await repository.update(1, { slug: 'pro' })

    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle when update throws', async () => {
    const error = new Error('db error')
    mockRepository.findOne.mockResolvedValue(mockPlanRaw)
    mockRepository.save.mockRejectedValue(error)

    await repository.update(1, { name: 'New Pro' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should delete a plan successfully', async () => {
    mockRepository.findOne.mockResolvedValue(mockPlanRaw)
    mockRepository.delete.mockResolvedValue(undefined)

    await repository.delete(1)

    expect(mockRepository.delete).toHaveBeenCalledWith(1)
  })

  it('should call errorService.handle when delete throws', async () => {
    const error = new Error('db error')
    mockRepository.findOne.mockResolvedValue(mockPlanRaw)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete(1)

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
