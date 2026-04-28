import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { CompanyResponsible } from '@company-responsible/entities/company-responsible.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CompanyResponsibleRepository } from './company-responsible.repository'

describe('CompanyResponsibleRepository', () => {
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
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyResponsibleRepository,
        { provide: getRepositoryToken(CompanyResponsible), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CompanyResponsibleRepository>(CompanyResponsibleRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll - deve retornar array', async () => {
    mockRepository.find.mockResolvedValue([mockResponsible])

    const result = await repository.getAll()

    expect(result).toEqual([mockResponsible])
    expect(mockRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } })
  })

  it('getAll - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById - deve retornar registro', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockResponsible)

    const result = await repository.getById('123')

    expect(result).toEqual(mockResponsible)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '123' })
  })

  it('getById - deve chamar errorService.handle com NotFoundException se não existe', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getById('999')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('getById - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockRejectedValue(error)

    await repository.getById('123')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getByCpf - deve retornar registro', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockResponsible)

    const result = await repository.getByCpf('12345678900')

    expect(result).toEqual(mockResponsible)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ cpf: '12345678900' })
  })

  it('getByCpf - deve chamar errorService.handle com NotFoundException se não existe', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getByCpf('000')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('create - deve criar registro', async () => {
    const dto = { name: 'John Doe', cpf: '12345678900' } as any
    mockRepository.create.mockReturnValue(dto)
    mockRepository.save.mockResolvedValue(mockResponsible)

    const result = await repository.create(dto)

    expect(result).toEqual(mockResponsible)
    expect(mockRepository.create).toHaveBeenCalledWith(dto)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('create - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.create.mockReturnValue({})
    mockRepository.save.mockRejectedValue(error)

    await repository.create({} as any)

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('update - deve atualizar registro', async () => {
    const dto = { name: 'Jane Doe' } as any
    const updated = { ...mockResponsible, name: 'Jane Doe' }
    mockRepository.findOneBy.mockResolvedValue(mockResponsible)
    mockRepository.save.mockResolvedValue(updated)

    const result = await repository.update('123', dto)

    expect(result).toEqual(updated)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('update - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockResponsible)
    mockRepository.save.mockRejectedValue(error)

    await repository.update('123', {} as any)

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete - deve deletar e retornar mensagem', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockResponsible)
    mockRepository.delete.mockResolvedValue(undefined)

    const result = await repository.delete('123')

    expect(result).toEqual({ message: 'Responsible was deleted successfully' })
    expect(mockRepository.delete).toHaveBeenCalledWith('123')
  })

  it('delete - deve chamar errorService.handle em erro', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockResponsible)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('123')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
