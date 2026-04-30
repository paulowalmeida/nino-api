// src/company/company.service.spec.ts
import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { CompanyRepository } from './company.repository'
import { CompanyService } from './company.service'

describe('CompanyService', () => {
  let service: CompanyService
  let repository: CompanyRepository

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

  const mockRepository = {
    getAll: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, size: 20, total: 0, totalPages: 0, previousPage: null, nextPage: null } }),
    getById: jest.fn(),
    getByCnpj: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: CompanyRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<CompanyService>(CompanyService)
    repository = module.get<CompanyRepository>(CompanyRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll - deve retornar companies paginadas', async () => {
    const query = { page: 1, size: 20 }
    mockRepository.getAll.mockResolvedValue({ data: [mockCompany], pagination: { page: 1, size: 20, total: 1, totalPages: 1, previousPage: null, nextPage: null } })

    const result = await service.getAll(query)

    expect(result.data).toEqual([mockCompany])
    expect(repository.getAll).toHaveBeenCalledWith(query)
  })

  it('getById - deve retornar company por id', async () => {
    mockRepository.getById.mockResolvedValue(mockCompany)

    const result = await service.getById('uuid-1')

    expect(result).toEqual(mockCompany)
    expect(repository.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('getById - deve lançar NotFoundException se não encontrar', async () => {
    mockRepository.getById.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.getById('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('getByCnpj - deve retornar company por cnpj', async () => {
    mockRepository.getByCnpj.mockResolvedValue(mockCompany)

    const result = await service.getByCnpj('12345678000190')

    expect(result).toEqual(mockCompany)
    expect(repository.getByCnpj).toHaveBeenCalledWith('12345678000190')
  })

  it('getByCnpj - deve lançar NotFoundException se não encontrar', async () => {
    mockRepository.getByCnpj.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.getByCnpj('invalid-cnpj')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create - deve criar nova company', async () => {
    const createData = { companyName: 'New Corp', cnpj: '98765432000100' }
    mockRepository.create.mockResolvedValue({ ...mockCompany, ...createData })

    const result = await service.create(createData)

    expect(result.companyName).toBe('New Corp')
    expect(repository.create).toHaveBeenCalledWith(createData)
  })

  it('create - deve lançar ConflictException se CNPJ já existe', async () => {
    const createData = { companyName: 'New Corp', cnpj: '12345678000190' }
    mockRepository.create.mockRejectedValue(
      new ConflictException('CNPJ already exists'),
    )

    await expect(service.create(createData)).rejects.toThrow(ConflictException)
  })

  it('update - deve atualizar company', async () => {
    const updateData = { companyName: 'Updated Corp' }
    mockRepository.update.mockResolvedValue({ ...mockCompany, ...updateData })

    const result = await service.update('uuid-1', updateData)

    expect(result.companyName).toBe('Updated Corp')
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('update - deve lançar NotFoundException se não existe', async () => {
    mockRepository.update.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.update('invalid-id', {})).rejects.toThrow(
      NotFoundException,
    )
  })

  it('update - deve lançar ConflictException se novo CNPJ já existe', async () => {
    mockRepository.update.mockRejectedValue(
      new ConflictException('CNPJ já cadastrado'),
    )

    await expect(
      service.update('uuid-1', { cnpj: '98765432000100' }),
    ).rejects.toThrow(ConflictException)
  })

  it('delete - deve deletar company', async () => {
    mockRepository.delete.mockResolvedValue({
      message: 'Company deleted successfully',
    })

    const result = await service.delete('uuid-1')

    expect(result).toEqual({ message: 'Company deleted successfully' })
    expect(repository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete - deve lançar NotFoundException se não existe', async () => {
    mockRepository.delete.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.delete('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('activate - deve ativar company', async () => {
    const activated = { ...mockCompany, isActive: true }
    mockRepository.activate.mockResolvedValue(activated)

    const result = await service.activate('uuid-1')

    expect(result.isActive).toBe(true)
    expect(repository.activate).toHaveBeenCalledWith('uuid-1')
  })

  it('activate - deve lançar NotFoundException se não existe', async () => {
    mockRepository.activate.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.activate('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('deactivate - deve desativar company', async () => {
    const deactivated = { ...mockCompany, isActive: false }
    mockRepository.deactivate.mockResolvedValue(deactivated)

    const result = await service.deactivate('uuid-1')

    expect(result.isActive).toBe(false)
    expect(repository.deactivate).toHaveBeenCalledWith('uuid-1')
  })

  it('deactivate - deve lançar NotFoundException se não existe', async () => {
    mockRepository.deactivate.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.deactivate('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })
})
