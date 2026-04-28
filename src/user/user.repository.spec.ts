import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { User } from '@user/entities/user.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { UserRepository } from './user.repository'

describe('UserRepository', () => {
  let repository: UserRepository

  const mockUser = { id: 'user-id', name: 'John Doe', roleId: 'role-id', companyId: 'company-id' }

  const mockRepository = {
    find: jest.fn(),
    findBy: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<UserRepository>(UserRepository)
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

  it('should get all users', async () => {
    mockRepository.find.mockResolvedValue([mockUser])

    const result = await repository.getAll()

    expect(result).toEqual([mockUser])
    expect(mockRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } })
  })

  it('should call errorService.handle when getAll throws', async () => {
    const error = new Error('db error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get a user by id', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockUser)

    const result = await repository.getById('user-id')

    expect(result).toEqual(mockUser)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'user-id' })
  })

  it('should call errorService.handle with NotFoundException when getById finds nothing', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getById('user-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('should get users by companyId', async () => {
    mockRepository.findBy.mockResolvedValue([mockUser])

    const result = await repository.getByCompanyId('company-id')

    expect(result).toEqual([mockUser])
    expect(mockRepository.findBy).toHaveBeenCalledWith({ companyId: 'company-id' })
  })

  it('should call errorService.handle when getByCompanyId throws', async () => {
    const error = new Error('db error')
    mockRepository.findBy.mockRejectedValue(error)

    await repository.getByCompanyId('company-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should update a user successfully', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockUser)
    mockRepository.save.mockResolvedValue(undefined)

    await repository.update('user-id', { name: 'Jane Doe' })

    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle when update throws', async () => {
    const error = new Error('db error')
    mockRepository.findOneBy.mockResolvedValue(mockUser)
    mockRepository.save.mockRejectedValue(error)

    await repository.update('user-id', { name: 'Jane Doe' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should delete a user successfully', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockUser)
    mockRepository.delete.mockResolvedValue(undefined)

    await repository.delete('user-id')

    expect(mockRepository.delete).toHaveBeenCalledWith('user-id')
  })

  it('should call errorService.handle when delete throws', async () => {
    const error = new Error('db error')
    mockRepository.findOneBy.mockResolvedValue(mockUser)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('user-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
