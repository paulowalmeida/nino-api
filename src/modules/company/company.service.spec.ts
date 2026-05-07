import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { CompanyRepository } from './company.repository'
import { CompanyService } from './company.service'

describe(CompanyService.name, () => {
  let service: CompanyService
  let repository: CompanyRepository

  const mockCompany = {
    id: 'uuid-1',
    name: 'Acme Corp',
    cnpj: '12345678000190',
    legalName: null,
    stateRegistration: null,
    legalNature: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRepository = {
    getAll: jest
      .fn()
      .mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          size: 20,
          total: 0,
          totalPages: 0,
          previousPage: null,
          nextPage: null,
        },
      }),
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

  it('should return paginated companies', async () => {
    const query = { page: 1, size: 20 }
    mockRepository.getAll.mockResolvedValue({
      data: [mockCompany],
      pagination: {
        page: 1,
        size: 20,
        total: 1,
        totalPages: 1,
        previousPage: null,
        nextPage: null,
      },
    })

    const result = await service.getAll(query as any)

    expect(result.data).toEqual([mockCompany])
    expect(repository.getAll).toHaveBeenCalledWith(query)
  })

  it('should return company by id', async () => {
    mockRepository.getById.mockResolvedValue(mockCompany)

    const result = await service.getById('uuid-1')

    expect(result).toEqual(mockCompany)
    expect(repository.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('should throw NotFoundException when company not found by id', async () => {
    mockRepository.getById.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.getById('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('should return company by cnpj', async () => {
    mockRepository.getByCnpj.mockResolvedValue(mockCompany)

    const result = await service.getByCnpj('12345678000190')

    expect(result).toEqual(mockCompany)
    expect(repository.getByCnpj).toHaveBeenCalledWith('12345678000190')
  })

  it('should throw NotFoundException when company not found by cnpj', async () => {
    mockRepository.getByCnpj.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.getByCnpj('invalid-cnpj')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('should create a new company', async () => {
    const createData = { name: 'New Corp', cnpj: '98765432000100' }
    mockRepository.create.mockResolvedValue({ ...mockCompany, ...createData })

    const result = await service.create(createData as any)

    expect(result.name).toBe('New Corp')
    expect(repository.create).toHaveBeenCalledWith(createData)
  })

  it('should throw ConflictException when CNPJ already exists on create', async () => {
    const createData = { name: 'New Corp', cnpj: '12345678000190' }
    mockRepository.create.mockRejectedValue(
      new ConflictException('CNPJ already exists'),
    )

    await expect(service.create(createData as any)).rejects.toThrow(
      ConflictException,
    )
  })

  it('should update company', async () => {
    const updateData = { name: 'Updated Corp' }
    mockRepository.update.mockResolvedValue({ ...mockCompany, ...updateData })

    const result = await service.update('uuid-1', updateData as any)

    expect(result.name).toBe('Updated Corp')
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('should throw NotFoundException when company not found on update', async () => {
    mockRepository.update.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.update('invalid-id', {} as any)).rejects.toThrow(
      NotFoundException,
    )
  })

  it('should throw ConflictException when new CNPJ already exists on update', async () => {
    mockRepository.update.mockRejectedValue(
      new ConflictException('CNPJ já cadastrado'),
    )

    await expect(
      service.update('uuid-1', { cnpj: '98765432000100' } as any),
    ).rejects.toThrow(ConflictException)
  })

  it('should delete company', async () => {
    mockRepository.delete.mockResolvedValue({
      message: 'Company deleted successfully',
    })

    const result = await service.delete('uuid-1')

    expect(result).toEqual({ message: 'Company deleted successfully' })
    expect(repository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('should throw NotFoundException when company not found on delete', async () => {
    mockRepository.delete.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.delete('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('should activate company', async () => {
    const activated = { ...mockCompany, isActive: true }
    mockRepository.activate.mockResolvedValue(activated)

    const result = await service.activate('uuid-1')

    expect(result.isActive).toBe(true)
    expect(repository.activate).toHaveBeenCalledWith('uuid-1')
  })

  it('should throw NotFoundException when company not found on activate', async () => {
    mockRepository.activate.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.activate('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('should deactivate company', async () => {
    const deactivated = { ...mockCompany, isActive: false }
    mockRepository.deactivate.mockResolvedValue(deactivated)

    const result = await service.deactivate('uuid-1')

    expect(result.isActive).toBe(false)
    expect(repository.deactivate).toHaveBeenCalledWith('uuid-1')
  })

  it('should throw NotFoundException when company not found on deactivate', async () => {
    mockRepository.deactivate.mockRejectedValue(
      new NotFoundException('Company not found'),
    )

    await expect(service.deactivate('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })
})
