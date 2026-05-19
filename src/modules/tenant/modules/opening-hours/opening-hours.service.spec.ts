import { Test, TestingModule } from '@nestjs/testing'

import { OpeningHours } from '@prisma/client'

import { OpeningHoursRepository } from './opening-hours.repository'
import { OpeningHoursService } from './opening-hours.service'

describe(OpeningHoursService.name, () => {
  let service: OpeningHoursService

  const mockOpeningHours: OpeningHours = {
    id: 'oh-1',
    tenantId: 'tenant-1',
    dayOfWeek: 1,
    openTime: '08:00',
    closeTime: '18:00',
    isOpen: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockRepo: Pick<
    OpeningHoursRepository,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockOpeningHours]),
    getById: jest.fn().mockResolvedValue(mockOpeningHours),
    create: jest.fn().mockResolvedValue(mockOpeningHours),
    update: jest.fn().mockResolvedValue(mockOpeningHours),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpeningHoursService,
        { provide: OpeningHoursRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<OpeningHoursService>(OpeningHoursService)
  })

  it('getAll() should delegate to repository', async () => {
    const result = await service.getAll('tenant-1')
    expect(mockRepo.getAll).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual([mockOpeningHours])
  })

  it('getById() should delegate to repository', async () => {
    const result = await service.getById('oh-1')
    expect(mockRepo.getById).toHaveBeenCalledWith('oh-1')
    expect(result).toEqual(mockOpeningHours)
  })

  it('create() should delegate to repository', async () => {
    const dto = {
      tenantId: 'tenant-1',
      dayOfWeek: 1,
      openTime: '08:00',
      closeTime: '18:00',
    }
    const result = await service.create(dto)
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockOpeningHours)
  })

  it('update() should delegate to repository', async () => {
    const dto = { isOpen: false }
    const result = await service.update('oh-1', dto)
    expect(mockRepo.update).toHaveBeenCalledWith('oh-1', dto)
    expect(result).toEqual(mockOpeningHours)
  })

  it('delete() should delegate to repository', async () => {
    const result = await service.delete('oh-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('oh-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
