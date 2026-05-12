import { Test, TestingModule } from '@nestjs/testing'

import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CompanyResponsibleService } from './company-responsible.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'

describe(CompanyResponsibleService.name, () => {
  let service: CompanyResponsibleService
  let repository: CompanyResponsibleRepository

  const mockResponsible = {
    id: '123',
    name: 'John Doe',
    cpf: '12345678900',
    email: 'john@example.com',
    phone: '11999999999',
    cnpj: '12345678000190',
    legalName: null,
    legalNature: null,
    stateRegistration: null,
    ownerId: 'owner-1',
    responsibleId: null,
    zipCode: null,
    street: null,
    number: null,
    complement: null,
    neighborhood: null,
    city: null,
    state: null,
    country: 'BR',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockRepository = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByCpf: jest.fn(),
    existsByCpf: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyResponsibleService,
        {
          provide: CompanyResponsibleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<CompanyResponsibleService>(CompanyResponsibleService)
    repository = module.get<CompanyResponsibleRepository>(
      CompanyResponsibleRepository,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return array of company responsibles', async () => {
    mockRepository.getAll.mockResolvedValue([mockResponsible])

    const result = await service.getAll()

    expect(result).toEqual([mockResponsible])
    expect(repository.getAll).toHaveBeenCalledTimes(1)
  })

  it('should return company responsible by id', async () => {
    mockRepository.getById.mockResolvedValue(mockResponsible)

    const result = await service.getById('123')

    expect(result).toEqual(mockResponsible)
    expect(repository.getById).toHaveBeenCalledWith('123')
  })

  it('should return company responsible by cpf', async () => {
    mockRepository.getByCpf.mockResolvedValue(mockResponsible)

    const result = await service.getByCpf('12345678900')

    expect(result).toEqual(mockResponsible)
    expect(repository.getByCpf).toHaveBeenCalledWith('12345678900')
  })

  it('should return existing responsible when CPF already exists on create', async () => {
    const dto: CreateCompanyResponsibleDto = {
      name: 'John Doe',
      cpf: '12345678900',
      email: 'john@example.com',
      phone: '11999999999',
    }
    mockRepository.existsByCpf.mockResolvedValue(true)
    mockRepository.getByCpf.mockResolvedValue(mockResponsible)

    const result = await service.create(dto)

    expect(result).toEqual(mockResponsible)
    expect(repository.existsByCpf).toHaveBeenCalledWith(dto.cpf)
    expect(repository.getByCpf).toHaveBeenCalledWith(dto.cpf)
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('should create new responsible when CPF does not exist', async () => {
    const dto: CreateCompanyResponsibleDto = {
      name: 'Jane Doe',
      cpf: '99988877700',
      email: 'jane@example.com',
      phone: '11988888888',
    }
    mockRepository.existsByCpf.mockResolvedValue(false)
    mockRepository.create.mockResolvedValue({ ...mockResponsible, ...dto })

    const result = await service.create(dto)

    expect(repository.existsByCpf).toHaveBeenCalledWith(dto.cpf)
    expect(repository.create).toHaveBeenCalledWith(dto)
    expect(repository.getByCpf).not.toHaveBeenCalled()
    expect(result.cpf).toBe(dto.cpf)
  })

  it('should update company responsible', async () => {
    const dto: UpdateCompanyResponsibleDto = {
      name: 'Jane Doe',
    }
    const updated = { ...mockResponsible, name: 'Jane Doe' }
    mockRepository.update.mockResolvedValue(undefined)
    mockRepository.getById.mockResolvedValue(updated)

    const result = await service.update('123', dto)

    expect(result).toEqual(updated)
    expect(repository.update).toHaveBeenCalledWith('123', dto)
    expect(repository.getById).toHaveBeenCalledWith('123')
  })

  it('should delete company responsible', async () => {
    const deleteResponse = { message: 'Responsible was deleted successfully' }
    mockRepository.delete.mockResolvedValue(deleteResponse)

    const result = await service.delete('123')

    expect(result).toEqual(deleteResponse)
    expect(repository.delete).toHaveBeenCalledWith('123')
  })
})
