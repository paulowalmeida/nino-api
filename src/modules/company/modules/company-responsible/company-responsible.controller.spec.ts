import { Test, TestingModule } from '@nestjs/testing'

import { CompanyResponsibleController } from './company-responsible.controller'
import { CompanyResponsibleService } from './company-responsible.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'

describe(CompanyResponsibleController.name, () => {
  let controller: CompanyResponsibleController
  let service: CompanyResponsibleService

  const mockResponsible = {
    id: '123',
    name: 'John Doe',
    cpf: '12345678900',
    email: 'john@example.com',
    phone: '11999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByCpf: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyResponsibleController],
      providers: [
        {
          provide: CompanyResponsibleService,
          useValue: mockService,
        },
      ],
    }).compile()

    controller = module.get<CompanyResponsibleController>(
      CompanyResponsibleController,
    )
    service = module.get<CompanyResponsibleService>(CompanyResponsibleService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return array of company responsibles', async () => {
    mockService.getAll.mockResolvedValue([mockResponsible])

    const result = await controller.getAll()

    expect(result).toEqual([mockResponsible])
    expect(service.getAll).toHaveBeenCalledTimes(1)
  })

  it('should return company responsible by id', async () => {
    mockService.getById.mockResolvedValue(mockResponsible)

    const result = await controller.getById('123')

    expect(result).toEqual(mockResponsible)
    expect(service.getById).toHaveBeenCalledWith('123')
  })

  it('should return company responsible by cpf', async () => {
    mockService.getByCpf.mockResolvedValue(mockResponsible)

    const result = await controller.getByCpf('12345678900')

    expect(result).toEqual(mockResponsible)
    expect(service.getByCpf).toHaveBeenCalledWith('12345678900')
  })

  it('should create new company responsible', async () => {
    const dto: CreateCompanyResponsibleDto = {
      name: 'John Doe',
      cpf: '12345678900',
      email: 'john@example.com',
      phone: '11999999999',
    }
    mockService.create.mockResolvedValue(mockResponsible)

    const result = await controller.create(dto)

    expect(result).toEqual(mockResponsible)
    expect(service.create).toHaveBeenCalledWith(dto)
  })

  it('should update company responsible', async () => {
    const dto: UpdateCompanyResponsibleDto = {
      name: 'Jane Doe',
    }
    const updated = { ...mockResponsible, name: 'Jane Doe' }
    mockService.update.mockResolvedValue(updated)

    const result = await controller.update('123', dto)

    expect(result).toEqual(updated)
    expect(service.update).toHaveBeenCalledWith('123', dto)
  })

  it('should delete company responsible', async () => {
    const deleteResponse = { message: 'Responsible was deleted successfully' }
    mockService.delete.mockResolvedValue(deleteResponse)

    const result = await controller.delete('123')

    expect(result).toEqual(deleteResponse)
    expect(service.delete).toHaveBeenCalledWith('123')
  })
})
