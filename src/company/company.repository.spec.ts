import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CompanyRepository } from './company.repository'

describe('CompanyRepository', () => {
  let repository: CompanyRepository
  let prismaService: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockCompany = {
    id: 'uuid-1',
    companyName: 'Acme Corp',
    cnpj: '12345678000190',
    legalName: null,
    stateRegistration: null,
    legalNature: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrismaService = {
    company: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockPrismaErrorService = {
    handleError: jest.fn().mockImplementation((error) => {
      throw error
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<CompanyRepository>(CompanyRepository)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll - deve retornar array de companies', async () => {
    mockPrismaService.company.findMany.mockResolvedValue([mockCompany])

    const result = await repository.getAll()

    expect(result).toEqual([mockCompany])
    expect(prismaService.company.findMany).toHaveBeenCalledWith({
      orderBy: { companyName: 'asc' },
    })
  })

  it('getAll - deve chamar handleError em caso de erro', async () => {
    const error = new Error('DB error')
    mockPrismaService.company.findMany.mockRejectedValue(error)

    await expect(repository.getAll()).rejects.toThrow(error)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('getById - deve retornar company por id', async () => {
    mockPrismaService.company.findUnique.mockResolvedValue(mockCompany)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockCompany)
    expect(prismaService.company.findUnique).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('getById - deve lançar NotFoundException se não existe', async () => {
    mockPrismaService.company.findUnique.mockResolvedValue(null)

    await expect(repository.getById('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('getById - deve chamar handleError em caso de erro', async () => {
    const error = new Error('DB error')
    mockPrismaService.company.findUnique.mockRejectedValue(error)

    await expect(repository.getById('uuid-1')).rejects.toThrow(error)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('getByCnpj - deve retornar company por cnpj', async () => {
    mockPrismaService.company.findUnique.mockResolvedValue(mockCompany)

    const result = await repository.getByCnpj('12345678000190')

    expect(result).toEqual(mockCompany)
    expect(prismaService.company.findUnique).toHaveBeenCalledWith({
      where: { cnpj: '12345678000190' },
    })
  })

  it('getByCnpj - deve lançar NotFoundException se não existe', async () => {
    mockPrismaService.company.findUnique.mockResolvedValue(null)

    await expect(repository.getByCnpj('invalid-cnpj')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('getByCnpj - deve chamar handleError em caso de erro', async () => {
    const error = new Error('DB error')
    mockPrismaService.company.findUnique.mockRejectedValue(error)

    await expect(repository.getByCnpj('12345678000190')).rejects.toThrow(error)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create - deve criar nova company', async () => {
    const createData = { companyName: 'New Corp', cnpj: '98765432000100' }
    mockPrismaService.company.findUnique.mockResolvedValue(null)
    mockPrismaService.company.create.mockResolvedValue(mockCompany)

    const result = await repository.create(createData)

    expect(result).toEqual(mockCompany)
    expect(prismaService.company.findUnique).toHaveBeenCalledWith({
      where: { cnpj: createData.cnpj },
    })
    expect(prismaService.company.create).toHaveBeenCalledWith({
      data: createData,
    })
  })

  it('create - deve lançar ConflictException se CNPJ já existe', async () => {
    const createData = { companyName: 'New Corp', cnpj: '12345678000190' }
    mockPrismaService.company.findUnique.mockResolvedValue(mockCompany)

    await expect(repository.create(createData)).rejects.toThrow(
      ConflictException,
    )
    expect(prismaService.company.create).not.toHaveBeenCalled()
  })

  it('create - deve chamar handleError em caso de erro', async () => {
    const error = new Error('DB error')
    const createData = { companyName: 'New Corp', cnpj: '98765432000100' }
    mockPrismaService.company.findUnique.mockResolvedValue(null)
    mockPrismaService.company.create.mockRejectedValue(error)

    await expect(repository.create(createData)).rejects.toThrow(error)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('update - deve atualizar company', async () => {
    const updateData = { companyName: 'Updated Corp' }
    const updated = { ...mockCompany, ...updateData }
    mockPrismaService.company.update.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(prismaService.company.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: updateData,
    })
  })

  it('update - deve lançar ConflictException se novo CNPJ já existe', async () => {
    const anotherCompany = {
      ...mockCompany,
      id: 'uuid-2',
      cnpj: '98765432000100',
    }
    const updateData = { cnpj: '98765432000100' }
    mockPrismaService.company.findUnique.mockResolvedValue(anotherCompany)

    await expect(repository.update('uuid-1', updateData)).rejects.toThrow(
      ConflictException,
    )
    expect(prismaService.company.update).not.toHaveBeenCalled()
  })

  it('update - deve permitir update se CNPJ é da própria company', async () => {
    const updateData = { cnpj: '12345678000190' }
    mockPrismaService.company.findUnique.mockResolvedValue(mockCompany)
    mockPrismaService.company.update.mockResolvedValue(mockCompany)

    await repository.update('uuid-1', updateData)

    expect(prismaService.company.update).toHaveBeenCalled()
  })

  it('update - não deve validar CNPJ se não vier no payload', async () => {
    const updateData = { companyName: 'Updated' }
    mockPrismaService.company.update.mockResolvedValue(mockCompany)

    await repository.update('uuid-1', updateData)

    expect(prismaService.company.findUnique).not.toHaveBeenCalled()
    expect(prismaService.company.update).toHaveBeenCalled()
  })

  it('update - deve chamar handleError em caso de erro', async () => {
    const error = new Error('DB error')
    mockPrismaService.company.update.mockRejectedValue(error)

    await expect(
      repository.update('uuid-1', { companyName: 'New' }),
    ).rejects.toThrow(error)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('delete - deve deletar company', async () => {
    mockPrismaService.company.delete.mockResolvedValue(mockCompany)

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Company deleted successfully' })
    expect(prismaService.company.delete).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('delete - deve chamar handleError em caso de erro', async () => {
    const error = new Error('DB error')
    mockPrismaService.company.delete.mockRejectedValue(error)

    await expect(repository.delete('uuid-1')).rejects.toThrow(error)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('activate - deve ativar company', async () => {
    const activated = { ...mockCompany, isActive: true }
    mockPrismaService.company.update.mockResolvedValue(activated)

    const result = await repository.activate('uuid-1')

    expect(result).toEqual(activated)
    expect(prismaService.company.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { isActive: true },
    })
  })

  it('activate - deve chamar handleError em caso de erro', async () => {
    const error = new Error('DB error')
    mockPrismaService.company.update.mockRejectedValue(error)

    await expect(repository.activate('uuid-1')).rejects.toThrow(error)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('deactivate - deve desativar company', async () => {
    const deactivated = { ...mockCompany, isActive: false }
    mockPrismaService.company.update.mockResolvedValue(deactivated)

    const result = await repository.deactivate('uuid-1')

    expect(result).toEqual(deactivated)
    expect(prismaService.company.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { isActive: false },
    })
  })

  it('deactivate - deve chamar handleError em caso de erro', async () => {
    const error = new Error('DB error')
    mockPrismaService.company.update.mockRejectedValue(error)

    await expect(repository.deactivate('uuid-1')).rejects.toThrow(error)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })
})