import { Test, TestingModule } from '@nestjs/testing'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CompanyResponsibleController } from './company-responsible.controller'
import { CompanyResponsibleService } from './company-responsible.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'
import { CompanyResponsibleResponse } from './types/company-responsible.type'

describe(CompanyResponsibleController.name, () => {
  let controller: CompanyResponsibleController

  const mockResponsible = {
    id: 'uuid-1',
    name: 'John Doe',
    cpf: '12345678900',
    email: 'john@example.com',
    phone: '11999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
    companies: [],
  } as unknown as CompanyResponsibleResponse

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockService: Pick<
    CompanyResponsibleService,
    'getAll' | 'getByField' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest
      .fn()
      .mockResolvedValue({ data: [mockResponsible], pagination: mockMeta }),
    getByField: jest.fn().mockResolvedValue(mockResponsible),
    create: jest.fn().mockResolvedValue(mockResponsible),
    update: jest.fn().mockResolvedValue(mockResponsible),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyResponsibleController],
      providers: [
        { provide: CompanyResponsibleService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<CompanyResponsibleController>(
      CompanyResponsibleController,
    )
  })

  it('getAll() should return paginated responsibles', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await controller.getAll(query)
    expect(mockService.getAll).toHaveBeenCalledWith(query)
    expect(result.data).toEqual([mockResponsible])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should return responsible by id', async () => {
    const result = await controller.getById('uuid-1')
    expect(mockService.getByField).toHaveBeenCalledWith('id', 'uuid-1')
    expect(result).toEqual(mockResponsible)
  })

  it('getByCpf() should return responsible by cpf', async () => {
    const result = await controller.getByCpf('12345678900')
    expect(mockService.getByField).toHaveBeenCalledWith('cpf', '12345678900')
    expect(result).toEqual(mockResponsible)
  })

  it('create() should create and return responsible', async () => {
    const dto: CreateCompanyResponsibleDto = {
      name: 'John Doe',
      cpf: '12345678900',
      email: 'john@example.com',
      phone: '11999999999',
    }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockResponsible)
  })

  it('update() should update and return responsible', async () => {
    const dto: UpdateCompanyResponsibleDto = { name: 'Jane Doe' }
    const result = await controller.update('uuid-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto)
    expect(result).toEqual(mockResponsible)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('uuid-1')
    expect(mockService.delete).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
