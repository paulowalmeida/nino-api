import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { CompanyRepository } from './company.repository'
import { Company } from './entities/company.entity'

describe('CompanyRepository', () => {
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
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyRepository,
        { provide: getRepositoryToken(Company), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<CompanyRepository>(CompanyRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll - deve retornar companies paginadas', async () => {
    mockRepository.findAndCount.mockResolvedValue([[mockCompany], 1])

    const result = await repository.getAll({ page: 1, size: 20 })

    expect(result.data).toEqual([mockCompany])
    expect(result.pagination).toMatchObject({ page: 1, size: 20, total: 1, totalPages: 1 })
    expect(mockRepository.findAndCount).toHaveBeenCalledWith({
      order: { companyName: 'ASC' },
      skip: 0,
      take: 20,
    })
  })

  it('getAll - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.findAndCount.mockRejectedValue(error)

    await repository.getAll({})

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById - deve retornar company por id', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockCompany)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockCompany)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' })
  })

  it('getById - deve chamar errorService.handle com NotFoundException se não existe', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getById('invalid-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('getById - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockRejectedValue(error)

    await repository.getById('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getByCnpj - deve retornar company por cnpj', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockCompany)

    const result = await repository.getByCnpj('12345678000190')

    expect(result).toEqual(mockCompany)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      cnpj: '12345678000190',
    })
  })

  it('getByCnpj - deve chamar errorService.handle com NotFoundException se não existe', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getByCnpj('invalid-cnpj')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('create - deve criar nova company', async () => {
    const createData = { companyName: 'New Corp', cnpj: '98765432000100' }
    mockRepository.findOneBy.mockResolvedValue(null)
    mockRepository.create.mockReturnValue(createData)
    mockRepository.save.mockResolvedValue(mockCompany)

    const result = await repository.create(createData as any)

    expect(result).toEqual(mockCompany)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      cnpj: createData.cnpj,
    })
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('create - deve chamar errorService.handle com ConflictException se CNPJ já existe', async () => {
    const createData = { companyName: 'New Corp', cnpj: '12345678000190' }
    mockRepository.findOneBy.mockResolvedValue(mockCompany)

    await repository.create(createData as any)

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('update - deve atualizar company', async () => {
    const updateData = { companyName: 'Updated Corp' }
    const updated = { ...mockCompany, ...updateData }
    mockRepository.findOneBy.mockResolvedValue(mockCompany)
    mockRepository.save.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('update - deve chamar errorService.handle com ConflictException se novo CNPJ já existe em outra empresa', async () => {
    const anotherCompany = {
      ...mockCompany,
      id: 'uuid-2',
      cnpj: '98765432000100',
    }
    mockRepository.findOneBy
      .mockResolvedValueOnce(mockCompany)
      .mockResolvedValueOnce(anotherCompany)

    await repository.update('uuid-1', { cnpj: '98765432000100' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('update - deve permitir update se CNPJ é da própria company', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockCompany)
    mockRepository.save.mockResolvedValue(mockCompany)

    await repository.update('uuid-1', { cnpj: '12345678000190' })

    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('update - não deve validar CNPJ se não vier no payload', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockCompany)
    mockRepository.save.mockResolvedValue(mockCompany)

    await repository.update('uuid-1', { companyName: 'Updated' })

    expect(mockRepository.findOneBy).toHaveBeenCalledTimes(1)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('delete - deve deletar company e retornar mensagem', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockCompany)
    mockRepository.delete.mockResolvedValue(undefined)

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Company deleted successfully' })
    expect(mockRepository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockCompany)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('activate - deve ativar company', async () => {
    const activated = { ...mockCompany, isActive: true }
    mockRepository.findOneBy.mockResolvedValue({
      ...mockCompany,
      isActive: false,
    })
    mockRepository.save.mockResolvedValue(activated)

    const result = await repository.activate('uuid-1')

    expect(result.isActive).toBe(true)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('activate - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockCompany)
    mockRepository.save.mockRejectedValue(error)

    await repository.activate('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('deactivate - deve desativar company', async () => {
    const deactivated = { ...mockCompany, isActive: false }
    mockRepository.findOneBy.mockResolvedValue(mockCompany)
    mockRepository.save.mockResolvedValue(deactivated)

    const result = await repository.deactivate('uuid-1')

    expect(result.isActive).toBe(false)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('deactivate - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockCompany)
    mockRepository.save.mockRejectedValue(error)

    await repository.deactivate('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
