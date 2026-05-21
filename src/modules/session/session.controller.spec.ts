import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { SessionController } from './session.controller'
import { SessionService } from './session.service'
import { SessionOrderBy } from './types/session-order-by.type'
import { SessionResponse } from './types/session.response.type'

describe(SessionController.name, () => {
  let controller: SessionController

  const mockSessionResponse = {
    id: 'session-id',
    expiresAt: new Date(),
    ipAddress: null,
    userAgent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-id',
      name: 'Test',
      credentials: [],
      role: { name: 'ADMIN' },
    },
  } as unknown as SessionResponse

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 20,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockService: Pick<
    SessionService,
    'getAll' | 'create' | 'getListByUserId' | 'getById' | 'update' | 'delete'
  > = {
    getAll: jest
      .fn()
      .mockResolvedValue({ data: [mockSessionResponse], pagination: mockMeta }),
    create: jest.fn().mockResolvedValue(mockSessionResponse),
    getListByUserId: jest
      .fn()
      .mockResolvedValue({ data: [mockSessionResponse], pagination: mockMeta }),
    getById: jest.fn().mockResolvedValue(mockSessionResponse),
    update: jest.fn().mockResolvedValue(mockSessionResponse),
    delete: jest
      .fn()
      .mockResolvedValue({ message: 'Session deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [{ provide: SessionService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<SessionController>(SessionController)
  })

  it('getAll() should return paginated sessions', async () => {
    const query = { page: 1, size: 20, target: SessionOrderBy.CREATED_AT }
    const result = await controller.getAll(query as never)
    expect(mockService.getAll).toHaveBeenCalledWith(query)
    expect(result.data).toEqual([mockSessionResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('create() should create a session', async () => {
    const dto = {
      userId: 'user-id',
      refreshToken: 'token',
      expiresAt: new Date(),
    }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockSessionResponse)
  })

  it('getListByUserId() should return paginated sessions', async () => {
    const query = { page: 1, size: 20, target: SessionOrderBy.CREATED_AT }
    const result = await controller.getListByUserId('user-id', query as never)
    expect(mockService.getListByUserId).toHaveBeenCalledWith('user-id', query)
    expect(result.data).toEqual([mockSessionResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should return a session by id', async () => {
    const result = await controller.getById('session-id')
    expect(mockService.getById).toHaveBeenCalledWith('session-id')
    expect(result).toEqual(mockSessionResponse)
  })

  it('update() should update and return SessionResponse', async () => {
    const dto = { refreshToken: 'new-token' }
    const result = await controller.update('session-id', dto)
    expect(mockService.update).toHaveBeenCalledWith('session-id', dto)
    expect(result).toEqual(mockSessionResponse)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('session-id')
    expect(mockService.delete).toHaveBeenCalledWith('session-id')
    expect(result).toEqual({ message: 'Session deleted successfully' })
  })
})
