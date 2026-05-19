import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { OpeningHours } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { OpeningHoursRepository } from './opening-hours.repository'

describe(OpeningHoursRepository.name, () => {
  let repository: OpeningHoursRepository

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

  const mockPrisma = {
    openingHours: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest
      .fn<never, [unknown, string?]>()
      .mockImplementation((e) => { throw e }),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation(
      (e: unknown): never => { throw e as never },
    )
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpeningHoursRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<OpeningHoursRepository>(OpeningHoursRepository)
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return opening hours for a tenant', async () => {
    mockPrisma.openingHours.findMany.mockResolvedValue([mockOpeningHours])
    const result = await repository.getAll('tenant-1')
    expect(result).toHaveLength(1)
    expect(result[0].tenantId).toBe('tenant-1')
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.openingHours.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll('tenant-1')).rejects.toThrow('db error')
  })

  it('getById() should return opening hours by id', async () => {
    mockPrisma.openingHours.findFirst.mockResolvedValue(mockOpeningHours)
    const result = await repository.getById('oh-1')
    expect(result.id).toBe('oh-1')
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPrisma.openingHours.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should create opening hours', async () => {
    mockPrisma.openingHours.create.mockResolvedValue(mockOpeningHours)
    const result = await repository.create({
      tenantId: 'tenant-1',
      dayOfWeek: 1,
      openTime: '08:00',
      closeTime: '18:00',
    })
    expect(result.id).toBe('oh-1')
  })

  it('create() should throw on db error', async () => {
    mockPrisma.openingHours.create.mockRejectedValue(new Error('db error'))
    await expect(
      repository.create({
        tenantId: 'tenant-1',
        dayOfWeek: 1,
        openTime: '08:00',
        closeTime: '18:00',
      }),
    ).rejects.toThrow('db error')
  })

  it('update() should update opening hours', async () => {
    mockPrisma.openingHours.update.mockResolvedValue(mockOpeningHours)
    const result = await repository.update('oh-1', { isOpen: false })
    expect(result.id).toBe('oh-1')
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.openingHours.update.mockResolvedValue({})
    const result = await repository.delete('oh-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(mockPrisma.openingHours.update).toHaveBeenCalledWith({
      where: { id: 'oh-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.openingHours.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('oh-1')).rejects.toThrow('db error')
  })
})
