import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { Credential } from '@credential/entities/credential.entity'
import { User } from '@user/entities/user.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { UserRepository } from './user.repository'

describe('UserRepository', () => {
  let repository: UserRepository

  const mockUser = { id: 'user-id', name: 'John Doe', roleId: 'role-id', companyId: 'company-id' }
  const mockUserResponse = { ...mockUser, credentials: [] }

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockCredentialRepository = { find: jest.fn() }
  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(Credential), useValue: mockCredentialRepository },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<UserRepository>(UserRepository)
    mockCredentialRepository.find.mockResolvedValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a user successfully', async () => {
    mockRepository.create.mockReturnValue(mockUser)
    mockRepository.save.mockResolvedValue(mockUser)

    const result = await repository.create({ name: 'John Doe', roleId: 'role-id' } as any)

    expect(result).toEqual(mockUser)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle when create throws', async () => {
    const error = new Error('db error')
    mockRepository.create.mockReturnValue({})
    mockRepository.save.mockRejectedValue(error)

    await repository.create({ name: 'John Doe', roleId: 'role-id' } as any)

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get all users with pagination', async () => {
    mockRepository.findAndCount.mockResolvedValue([[mockUser], 1])

    const result = await repository.getAll({ page: 1, size: 20 })

    expect(result.data).toEqual([mockUserResponse])
    expect(result.pagination).toEqual({ page: 1, size: 20, total: 1, totalPages: 1, previousPage: null, nextPage: null })
    expect(mockRepository.findAndCount).toHaveBeenCalledWith({
      order: { name: 'ASC' },
      relations: ['role', 'company'],
      skip: 0,
      take: 20,
    })
  })

  it('should call errorService.handle when getAll throws', async () => {
    const error = new Error('db error')
    mockRepository.findAndCount.mockRejectedValue(error)

    await repository.getAll({})

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get a user by id', async () => {
    mockRepository.findOne.mockResolvedValue(mockUser)

    const result = await repository.getById('user-id')

    expect(result).toEqual(mockUserResponse)
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      relations: ['role', 'company'],
    })
  })

  it('should call errorService.handle with NotFoundException when getById finds nothing', async () => {
    mockRepository.findOne.mockResolvedValue(null)

    await repository.getById('user-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('should get users by companyId', async () => {
    mockRepository.find.mockResolvedValue([mockUser])

    const result = await repository.getByCompanyId('company-id')

    expect(result).toEqual([mockUserResponse])
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { companyId: 'company-id' },
      relations: ['role', 'company'],
    })
  })

  it('should call errorService.handle when getByCompanyId throws', async () => {
    const error = new Error('db error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getByCompanyId('company-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should update a user successfully', async () => {
    mockRepository.findOne.mockResolvedValue(mockUser)
    mockRepository.save.mockResolvedValue(undefined)

    await repository.update('user-id', { name: 'Jane Doe' })

    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle when update throws', async () => {
    const error = new Error('db error')
    mockRepository.findOne.mockResolvedValue(mockUser)
    mockRepository.save.mockRejectedValue(error)

    await repository.update('user-id', { name: 'Jane Doe' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should delete a user successfully', async () => {
    mockRepository.findOne.mockResolvedValue(mockUser)
    mockRepository.delete.mockResolvedValue(undefined)

    await repository.delete('user-id')

    expect(mockRepository.delete).toHaveBeenCalledWith('user-id')
  })

  it('should call errorService.handle when delete throws', async () => {
    const error = new Error('db error')
    mockRepository.findOne.mockResolvedValue(mockUser)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('user-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
