import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CompanyResponsibleRepository } from './company-responsible.repository'

describe('CompanyResponsibleRepository', () => {
  let repository: CompanyResponsibleRepository
  let prisma: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockResponsible = {
    id: '123',
    name: 'John Doe',
    cpf: '12345678900',
    email: 'john@example.com',
    phone: '11999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrisma = {
    companyResponsible: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockPrismaErrorService = {
    handleError: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyResponsibleRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<CompanyResponsibleRepository>(
      CompanyResponsibleRepository,
    )
    prisma = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)

    mockPrismaErrorService.handleError.mockImplementation((error) => {
      throw error
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll - deve retornar array', async () => {
    mockPrisma.companyResponsible.findMany.mockResolvedValue([mockResponsible])
    const result = await repository.getAll()
    expect(result).toEqual([mockResponsible])
  })

  it('getAll - deve chamar handleError', async () => {
    const dbError = new Error('DB error')
    mockPrisma.companyResponsible.findMany.mockRejectedValue(dbError)

    await expect(repository.getAll()).rejects.toThrow(dbError)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(dbError)
  })

  it('getById - deve retornar registro', async () => {
    mockPrisma.companyResponsible.findUnique.mockResolvedValue(mockResponsible)
    const result = await repository.getById('123')
    expect(result).toEqual(mockResponsible)
  })

  it('getById - deve lançar NotFoundException', async () => {
    mockPrisma.companyResponsible.findUnique.mockResolvedValue(null)
    await expect(repository.getById('999')).rejects.toThrow(NotFoundException)
  })

  it('getById - deve chamar handleError', async () => {
    const dbError = new Error('DB error')
    mockPrisma.companyResponsible.findUnique.mockRejectedValue(dbError)

    await expect(repository.getById('123')).rejects.toThrow(dbError)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(dbError)
  })

  it('getByCpf - deve retornar registro', async () => {
    mockPrisma.companyResponsible.findUnique.mockResolvedValue(mockResponsible)
    const result = await repository.getByCpf('12345678900')
    expect(result).toEqual(mockResponsible)
  })

  it('getByCpf - deve lançar NotFoundException', async () => {
    mockPrisma.companyResponsible.findUnique.mockResolvedValue(null)
    await expect(repository.getByCpf('999')).rejects.toThrow(NotFoundException)
  })

  it('getByCpf - deve chamar handleError', async () => {
    const dbError = new Error('DB error')
    mockPrisma.companyResponsible.findUnique.mockRejectedValue(dbError)

    await expect(repository.getByCpf('12345678900')).rejects.toThrow(dbError)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(dbError)
  })

  it('create - deve criar registro', async () => {
    const dto = { name: 'John Doe', cpf: '12345678900' } as any
    mockPrisma.companyResponsible.create.mockResolvedValue(mockResponsible)
    
    const result = await repository.create(dto)
    expect(result).toEqual(mockResponsible)
    expect(prisma.companyResponsible.create).toHaveBeenCalledWith({ data: dto })
  })

  it('create - deve chamar handleError', async () => {
    const dbError = new Error('DB error')
    mockPrisma.companyResponsible.create.mockRejectedValue(dbError)

    await expect(repository.create({} as any)).rejects.toThrow(dbError)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(dbError)
  })

  it('update - deve atualizar registro', async () => {
    const dto = { name: 'Jane Doe' } as any
    const updated = { ...mockResponsible, name: 'Jane Doe' }
    mockPrisma.companyResponsible.update.mockResolvedValue(updated)
    
    const result = await repository.update('123', dto)
    expect(result).toEqual(updated)
    expect(prisma.companyResponsible.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: dto,
    })
  })

  it('update - deve chamar handleError', async () => {
    const dbError = new Error('DB error')
    mockPrisma.companyResponsible.update.mockRejectedValue(dbError)

    await expect(repository.update('123', {} as any)).rejects.toThrow(dbError)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(dbError)
  })

  it('delete - deve deletar e retornar mensagem', async () => {
    mockPrisma.companyResponsible.delete.mockResolvedValue(mockResponsible)
    
    const result = await repository.delete('123')
    expect(result.message).toBe('Responsible was deleted successfully')
    expect(prisma.companyResponsible.delete).toHaveBeenCalledWith({
      where: { id: '123' },
    })
  })

  it('delete - deve chamar handleError', async () => {
    const dbError = new Error('DB error')
    mockPrisma.companyResponsible.delete.mockRejectedValue(dbError)

    await expect(repository.delete('123')).rejects.toThrow(dbError)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(dbError)
  })
})