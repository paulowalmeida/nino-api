import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CompanyResponsibleRepository } from './company-responsible.repository'

describe(CompanyResponsibleRepository.name, () => {
  let repository: CompanyResponsibleRepository

  const mockCompany = {
    id: 'company-id',
    companyName: 'Acme',
    cnpj: '12345678000190',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockResponsible = {
    id: '123',
    name: 'John Doe',
    cpf: '12345678900',
    email: 'john@example.com',
    phone: '11999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    companies: [mockCompany],
  }

  const mockPrisma = {
    companyResponsible: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyResponsibleRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CompanyResponsibleRepository>(
      CompanyResponsibleRepository,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return array of responsibles without deletedAt', async () => {
    mockPrisma.companyResponsible.findMany.mockResolvedValue([mockResponsible])
    const result = await repository.getAll()
    expect(result).toHaveLength(1)
    expect((result[0] as any).deletedAt).toBeUndefined()
    expect(result[0].companies).toEqual([mockCompany])
  })

  it('should call errorService.handle on error in getAll', async () => {
    const error = new Error('DB error')
    mockPrisma.companyResponsible.findMany.mockRejectedValue(error)
    await repository.getAll()
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should return responsible by id without deletedAt', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
    const result = await repository.getById('123')
    expect((result as any).deletedAt).toBeUndefined()
    expect(result.companies).toEqual([mockCompany])
  })

  it('should call errorService.handle with NotFoundException when not found by id', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(null)
    await repository.getById('999')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should return responsible by cpf without deletedAt', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
    const result = await repository.getByCpf('12345678900')
    expect((result as any).deletedAt).toBeUndefined()
    expect(result.companies).toEqual([mockCompany])
  })

  it('should create responsible and return without deletedAt', async () => {
    mockPrisma.companyResponsible.create.mockResolvedValue(mockResponsible)
    const result = await repository.create({
      name: 'John Doe',
      cpf: '12345678900',
    } as any)
    expect((result as any).deletedAt).toBeUndefined()
    expect(result.companies).toEqual([mockCompany])
  })

  it('should update responsible', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
    mockPrisma.companyResponsible.update.mockResolvedValue(undefined)
    await repository.update('123', { name: 'Jane Doe' } as any)
    expect(mockPrisma.companyResponsible.update).toHaveBeenCalled()
  })

  it('should soft delete and return message', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
    mockPrisma.companyResponsible.update.mockResolvedValue({
      ...mockResponsible,
      deletedAt: new Date(),
    })
    const result = await repository.delete('123')
    expect(result).toEqual({ message: 'Responsible was deleted successfully' })
  })

  it('should call errorService.handle when responsible not found on delete', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(null)
    await repository.delete('999')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should call errorService.handle with NotFoundException when getByCpf finds nothing', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(null)
    await repository.getByCpf('00000000000')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should call errorService.handle when getByCpf throws', async () => {
    const error = new Error('db error')
    mockPrisma.companyResponsible.findFirst.mockRejectedValue(error)
    await repository.getByCpf('12345678900')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should return true when existsByCpf finds a record', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
    const result = await repository.existsByCpf('12345678900')
    expect(result).toBe(true)
  })

  it('should return false when existsByCpf finds nothing', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(null)
    const result = await repository.existsByCpf('00000000000')
    expect(result).toBe(false)
  })

  it('should call errorService.handle when existsByCpf throws', async () => {
    const error = new Error('db error')
    mockPrisma.companyResponsible.findFirst.mockRejectedValue(error)
    await repository.existsByCpf('12345678900')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should call errorService.handle when create throws', async () => {
    const error = new Error('db error')
    mockPrisma.companyResponsible.create.mockRejectedValue(error)
    await repository.create({ name: 'John', cpf: '12345678900' } as any)
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should call errorService.handle with NotFoundException when update finds nothing', async () => {
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(null)
    await repository.update('999', { name: 'x' } as any)
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should call errorService.handle when update prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
    mockPrisma.companyResponsible.update.mockRejectedValue(error)
    await repository.update('123', { name: 'x' } as any)
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should call errorService.handle when delete prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
    mockPrisma.companyResponsible.update.mockRejectedValue(error)
    await repository.delete('123')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
