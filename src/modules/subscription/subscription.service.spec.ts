import { Test, TestingModule } from '@nestjs/testing'

import { Plan } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { SubscriptionRepository } from './subscription.repository'
import { SubscriptionService } from './subscription.service'
import { ActivateSubscriptionDto } from './dtos/activate-subscription.dto'
import { CancelSubscriptionDto } from './dtos/cancel-subscription.dto'
import { ChangePlanDto } from './dtos/change-plan.dto'
import { CreateSubscriptionDto } from './dtos/create-subscription.dto'
import { SubscriptionFull } from './types/subscription-full.type'
import { SubscriptionResponse } from './types/subscription-response.type'

describe(SubscriptionService.name, () => {
  let service: SubscriptionService

  const now = new Date()

  const mockFull: SubscriptionFull = {
    id: 'sub-1',
    companyId: 'company-1',
    planId: 'plan-1',
    subscriptionStatusId: 'status-1',
    isActive: true,
    startedAt: now,
    trialEndsAt: now,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    plan: {
      id: 'plan-1',
      name: 'Pro',
      slug: 'pro',
      typeId: 'type-1',
      price: 99.9 as unknown as Plan['price'],
      maxTenants: 5,
      maxProducts: 100,
      maxOrders: 500,
      hasPrioritySupport: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    subscriptionStatus: {
      id: 'status-1',
      name: 'TRIAL',
      description: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  }

  const mockResponse: SubscriptionResponse = {
    id: 'sub-1',
    companyId: 'company-1',
    isActive: true,
    startedAt: now,
    trialEndsAt: now,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
    plan: mockFull.plan,
    subscriptionStatus: mockFull.subscriptionStatus,
  }

  const mockPaginated = {
    data: [mockFull],
    pagination: {
      page: 1,
      size: 10,
      total: 1,
      totalPages: 1,
      previousPage: null,
      nextPage: null,
    },
  }

  const mockRepo: Pick<
    SubscriptionRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest.fn().mockResolvedValue(mockPaginated),
    findItem: jest.fn().mockResolvedValue(mockFull),
    insert: jest.fn().mockResolvedValue(mockFull),
    updateItem: jest.fn().mockResolvedValue(mockFull),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: SubscriptionRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: { userTenant: { findFirst: jest.fn() } } },
      ],
    }).compile()

    service = module.get<SubscriptionService>(SubscriptionService)
  })

  it('getAll() should return paginated SubscriptionResponse', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll(query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      order: { target: 'createdAt', direction: 'desc' },
      include: { plan: true, subscriptionStatus: true },
    })
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination.total).toBe(1)
    expect((result.data[0] as Record<string, unknown>).planId).toBeUndefined()
    expect(
      (result.data[0] as Record<string, unknown>).subscriptionStatusId,
    ).toBeUndefined()
    expect(
      (result.data[0] as Record<string, unknown>).deletedAt,
    ).toBeUndefined()
  })

  it('getById() should return mapped SubscriptionResponse', async () => {
    const result = await service.getById('sub-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      include: { plan: true, subscriptionStatus: true },
    })
    expect(result).toEqual(mockResponse)
  })

  it('getActiveByCompany() should find by companyId and isActive', async () => {
    const result = await service.getActiveByCompany('company-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { companyId: 'company-1', isActive: true },
      include: { plan: true, subscriptionStatus: true },
    })
    expect(result).toEqual(mockResponse)
  })

  it('create() should insert with trialEndsAt and return mapped response', async () => {
    const dto: CreateSubscriptionDto = {
      companyId: 'company-1',
      planId: 'plan-1',
      subscriptionStatusId: 'status-1',
    }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: {
        companyId: 'company-1',
        planId: 'plan-1',
        subscriptionStatusId: 'status-1',
        isActive: true,
        trialEndsAt: expect.any(Date),
      },
      include: { plan: true, subscriptionStatus: true },
    })
    expect(result).toEqual(mockResponse)
  })

  it('activate() should update status, clear trialEndsAt and set expiresAt', async () => {
    const dto: ActivateSubscriptionDto = {
      subscriptionStatusId: 'status-active',
    }
    const result = await service.activate('sub-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: {
        subscriptionStatusId: 'status-active',
        trialEndsAt: null,
        expiresAt: expect.any(Date),
      },
      include: { plan: true, subscriptionStatus: true },
    })
    expect(result).toEqual(mockResponse)
  })

  it('cancel() should update status and set isActive to null', async () => {
    const dto: CancelSubscriptionDto = {
      subscriptionStatusId: 'status-cancelled',
    }
    const result = await service.cancel('sub-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { subscriptionStatusId: 'status-cancelled', isActive: null },
      include: { plan: true, subscriptionStatus: true },
    })
    expect(result).toEqual(mockResponse)
  })

  it('changePlan() should update planId and return mapped response', async () => {
    const dto: ChangePlanDto = { planId: 'plan-2' }
    const result = await service.changePlan('sub-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: dto,
      include: { plan: true, subscriptionStatus: true },
    })
    expect(result).toEqual(mockResponse)
  })

  it('delete() should call softDelete with id', async () => {
    const result = await service.delete('sub-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'sub-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
