import { Test, TestingModule } from '@nestjs/testing'

import { CompanyResponsibleService } from './company-responsible.service'
import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'

describe('CompanyResponsibleService', () => {
  let service: CompanyResponsibleService
  let repository: CompanyResponsibleRepository

  const mockResponsible = {
    id: '123',
    name: 'John Doe',
    cpf: '12345678900',
    email: 'john@example.com',
    phone: '11999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRepository = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByCpf: jest.fn(),
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

  it('getAll - should return array of company responsibles', async () => {
    mockRepository.getAll.mockResolvedValue([mockResponsible])

    const result = await service.getAll()

    expect(result).toEqual([mockResponsible])
    expect(repository.getAll).toHaveBeenCalledTimes(1)
  })

  it('getById - should return company responsible by id', async () => {
    mockRepository.getById.mockResolvedValue(mockResponsible)

    const result = await service.getById('123')

    expect(result).toEqual(mockResponsible)
    expect(repository.getById).toHaveBeenCalledWith('123')
  })

  it('getByCpf - should return company responsible by cpf', async () => {
    mockRepository.getByCpf.mockResolvedValue(mockResponsible)

    const result = await service.getByCpf('12345678900')

    expect(result).toEqual(mockResponsible)
    expect(repository.getByCpf).toHaveBeenCalledWith('12345678900')
  })

  it('create - should call getByCpf instead of create', async () => {
    const dto: CreateCompanyResponsibleDto = {
      name: 'John Doe',
      cpf: '12345678900',
      email: 'john@example.com',
      phone: '11999999999',
      companyId: '123'
    }
    mockRepository.getByCpf.mockResolvedValue(mockResponsible)

    const result = await service.create(dto)

    expect(result).toEqual(mockResponsible)
    expect(repository.getByCpf).toHaveBeenCalledWith(dto.cpf)
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('update - should update company responsible', async () => {
    const dto: UpdateCompanyResponsibleDto = {
      name: 'Jane Doe',
    }
    const updated = { ...mockResponsible, name: 'Jane Doe' }
    mockRepository.update.mockResolvedValue(updated)

    const result = await service.update('123', dto)

    expect(result).toEqual(updated)
    expect(repository.update).toHaveBeenCalledWith('123', dto)
  })

  it('delete - should delete company responsible', async () => {
    const deleteResponse = { message: 'Responsible was deleted successfully' }
    mockRepository.delete.mockResolvedValue(deleteResponse)

    const result = await service.delete('123')

    expect(result).toEqual(deleteResponse)
    expect(repository.delete).toHaveBeenCalledWith('123')
  })
})
