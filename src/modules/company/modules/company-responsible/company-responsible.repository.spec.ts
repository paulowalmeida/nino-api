import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { Company, CompanyResponsible } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CompanyResponsibleWithCompanies } from './types/company-responsible-with-companies.type'

describe(CompanyResponsibleRepository.name, () => {
  let repository: CompanyResponsibleRepository

  const mockCompany: Company = {
    id: 'company-id',
    name: 'Acme',
    cnpj: '12345678000190',
    legalName: null,
    stateRegistration: null,
    legalNature: null,
    ownerId: 'owner-1',
    responsibleId: 'responsible-1',
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

  const mockResponsible: CompanyResponsibleWithCompanies = {
    id: 'uuid-1',
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
      count: jest.fn(),
    },
  }

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => {
      throw e
    }),
  }

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

  afterEach(() => jest.clearAllMocks())

  describe('getAll()', () => {
    it('should return responsibles without deletedAt', async () => {
      mockPrisma.companyResponsible.findMany.mockResolvedValue([mockResponsible])
      const result = await repository.getAll()
      expect(result).toHaveLength(1)
      expect(result[0]).not.toHaveProperty('deletedAt')
      expect(result[0].companies).toEqual([mockCompany])
    })

    it('should throw on db error', async () => {
      mockPrisma.companyResponsible.findMany.mockRejectedValue(
        new Error('db error'),
      )
      await expect(repository.getAll()).rejects.toThrow('db error')
    })
  })

  describe('getById()', () => {
    it('should return responsible without deletedAt', async () => {
      mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
      const result = await repository.getById('uuid-1')
      expect(result).not.toHaveProperty('deletedAt')
      expect(result.companies).toEqual([mockCompany])
    })

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.companyResponsible.findFirst.mockResolvedValue(null)
      await expect(repository.getById('invalid')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getByCpf()', () => {
    it('should return responsible without deletedAt', async () => {
      mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
      const result = await repository.getByCpf('12345678900')
      expect(result).not.toHaveProperty('deletedAt')
      expect(result.companies).toEqual([mockCompany])
    })

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.companyResponsible.findFirst.mockResolvedValue(null)
      await expect(repository.getByCpf('invalid')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw on db error', async () => {
      mockPrisma.companyResponsible.findFirst.mockRejectedValue(
        new Error('db error'),
      )
      await expect(repository.getByCpf('12345678900')).rejects.toThrow(
        'db error',
      )
    })
  })

  describe('existsByCpf()', () => {
    it('should return true when record exists', async () => {
      mockPrisma.companyResponsible.findFirst.mockResolvedValue(mockResponsible)
      expect(await repository.existsByCpf('12345678900')).toBe(true)
    })

    it('should return false when record does not exist', async () => {
      mockPrisma.companyResponsible.findFirst.mockResolvedValue(null)
      expect(await repository.existsByCpf('00000000000')).toBe(false)
    })

    it('should throw on db error', async () => {
      mockPrisma.companyResponsible.findFirst.mockRejectedValue(
        new Error('db error'),
      )
      await expect(repository.existsByCpf('12345678900')).rejects.toThrow(
        'db error',
      )
    })
  })

  describe('create()', () => {
    it('should create and return responsible without deletedAt', async () => {
      mockPrisma.companyResponsible.create.mockResolvedValue(mockResponsible)
      const result = await repository.create({
        name: 'John Doe',
        cpf: '12345678900',
        email: 'john@example.com',
        phone: '11999999999',
      })
      expect(result).not.toHaveProperty('deletedAt')
      expect(result.companies).toEqual([mockCompany])
    })

    it('should throw on db error', async () => {
      mockPrisma.companyResponsible.create.mockRejectedValue(
        new Error('db error'),
      )
      await expect(
        repository.create({
          name: 'John',
          cpf: '12345678900',
          email: 'john@example.com',
          phone: '11999999999',
        }),
      ).rejects.toThrow('db error')
    })
  })

  describe('update()', () => {
    it('should call update with id and data', async () => {
      mockPrisma.companyResponsible.update.mockResolvedValue(undefined)
      await repository.update('uuid-1', { name: 'Jane Doe' })
      expect(mockPrisma.companyResponsible.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { name: 'Jane Doe' },
      })
    })

    it('should throw on db error', async () => {
      mockPrisma.companyResponsible.update.mockRejectedValue(
        new Error('db error'),
      )
      await expect(
        repository.update('uuid-1', { name: 'x' }),
      ).rejects.toThrow('db error')
    })
  })

  describe('delete()', () => {
    it('should soft delete and return success message', async () => {
      mockPrisma.companyResponsible.update.mockResolvedValue({})
      expect(await repository.delete('uuid-1')).toEqual({
        message: 'Deleted successfully',
      })
    })

    it('should throw on db error', async () => {
      mockPrisma.companyResponsible.update.mockRejectedValue(
        new Error('db error'),
      )
      await expect(repository.delete('uuid-1')).rejects.toThrow('db error')
    })
  })
})
