import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { Company } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CompanyRepository } from './company.repository'

describe(CompanyRepository.name, () => {
  let repository: CompanyRepository

  const mockCompany: Company = {
    id: 'uuid-1',
    name: 'Acme Corp',
    cnpj: '12345678000190',
    legalName: null,
    legalNature: null,
    stateRegistration: null,
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

  const mockPrisma = {
    company: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
        CompanyRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<CompanyRepository>(CompanyRepository)
  })

  afterEach(() => jest.clearAllMocks())

  describe('getAll()', () => {
    it('should return paginated companies', async () => {
      mockPrisma.company.findMany.mockResolvedValue([mockCompany])
      mockPrisma.company.count.mockResolvedValue(1)
      const result = await repository.getAll({ page: 1, size: 20 })
      expect(result.data).toEqual([mockCompany])
      expect(result.pagination).toMatchObject({
        page: 1,
        size: 20,
        total: 1,
        totalPages: 1,
      })
    })

    it('should throw on db error', async () => {
      mockPrisma.company.findMany.mockRejectedValue(new Error('db error'))
      mockPrisma.company.count.mockResolvedValue(0)
      await expect(repository.getAll({ page: 1, size: 10 })).rejects.toThrow(
        'db error',
      )
    })
  })

  describe('getById()', () => {
    it('should return company by id', async () => {
      mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
      expect(await repository.getById('uuid-1')).toEqual(mockCompany)
    })

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.company.findFirst.mockResolvedValue(null)
      await expect(repository.getById('invalid')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getByCnpj()', () => {
    it('should return company by cnpj', async () => {
      mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
      expect(await repository.getByCnpj('12345678000190')).toEqual(mockCompany)
    })

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.company.findFirst.mockResolvedValue(null)
      await expect(repository.getByCnpj('invalid')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('create()', () => {
    it('should create and return company', async () => {
      mockPrisma.company.create.mockResolvedValue(mockCompany)
      const result = await repository.create({
        name: 'Acme Corp',
        cnpj: '12345678000190',
        ownerId: 'owner-1',
        responsibleId: 'responsible-1',
      })
      expect(result).toEqual(mockCompany)
      expect(mockPrisma.company.create).toHaveBeenCalledWith({
        data: {
          name: 'Acme Corp',
          cnpj: '12345678000190',
          ownerId: 'owner-1',
          responsibleId: 'responsible-1',
        },
      })
    })

    it('should throw on db error', async () => {
      mockPrisma.company.create.mockRejectedValue(new Error('db error'))
      await expect(
        repository.create({
          name: 'X',
          cnpj: '123',
          ownerId: 'owner-1',
          responsibleId: 'responsible-1',
        }),
      ).rejects.toThrow('db error')
    })
  })

  describe('update()', () => {
    it('should update and return company', async () => {
      const updated = { ...mockCompany, name: 'Updated Corp' }
      mockPrisma.company.update.mockResolvedValue(updated)
      expect(await repository.update('uuid-1', { name: 'Updated Corp' })).toEqual(updated)
    })

    it('should throw on db error', async () => {
      mockPrisma.company.update.mockRejectedValue(new Error('db error'))
      await expect(repository.update('uuid-1', { name: 'New' })).rejects.toThrow(
        'db error',
      )
    })
  })

  describe('delete()', () => {
    it('should soft delete and return success message', async () => {
      mockPrisma.company.update.mockResolvedValue({})
      expect(await repository.delete('uuid-1')).toEqual({
        message: 'Deleted successfully',
      })
    })

    it('should throw on db error', async () => {
      mockPrisma.company.update.mockRejectedValue(new Error('db error'))
      await expect(repository.delete('uuid-1')).rejects.toThrow('db error')
    })
  })

  describe('activate()', () => {
    it('should activate company', async () => {
      mockPrisma.company.update.mockResolvedValue({ ...mockCompany, isActive: true })
      expect((await repository.activate('uuid-1')).isActive).toBe(true)
    })

    it('should throw on db error', async () => {
      mockPrisma.company.update.mockRejectedValue(new Error('db error'))
      await expect(repository.activate('uuid-1')).rejects.toThrow('db error')
    })
  })

  describe('deactivate()', () => {
    it('should deactivate company', async () => {
      mockPrisma.company.update.mockResolvedValue({ ...mockCompany, isActive: false })
      expect((await repository.deactivate('uuid-1')).isActive).toBe(false)
    })

    it('should throw on db error', async () => {
      mockPrisma.company.update.mockRejectedValue(new Error('db error'))
      await expect(repository.deactivate('uuid-1')).rejects.toThrow('db error')
    })
  })
})
