import { Test, TestingModule } from '@nestjs/testing'

import { Plan } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { ActivateSubscriptionDto } from './dtos/activate-subscription.dto'
import { CancelSubscriptionDto } from './dtos/cancel-subscription.dto'
import { ChangePlanDto } from './dtos/change-plan.dto'
import { CreateSubscriptionDto } from './dtos/create-subscription.dto'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionService } from './subscription.service'
import { SubscriptionResponse } from './types/subscription-response.type'

describe(SubscriptionController.name, () => {
  let controller: SubscriptionController

  const now = new Date()

  const mockResponse: SubscriptionResponse = {
    id: 'sub-1',
    companyId: 'company-1',
    isActive: true,
    startedAt: now,
    trialEndsAt: now,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
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

  const mockService: Pick<
    SubscriptionService,
    | 'getAll'
    | 'getById'
    | 'getActiveByCompany'
    | 'create'
    | 'activate'
    | 'cancel'
    | 'changePlan'
    | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue({
      data: [mockResponse],
      pagination: {
        page: 1,
        size: 10,
        total: 1,
        totalPages: 1,
        previousPage: null,
        nextPage: null,
      },
    }),
    getById: jest.fn().mockResolvedValue(mockResponse),
    getActiveByCompany: jest.fn().mockResolvedValue(mockResponse),
    create: jest.fn().mockResolvedValue(mockResponse),
    activate: jest.fn().mockResolvedValue(mockResponse),
    cancel: jest.fn().mockResolvedValue(mockResponse),
    changePlan: jest.fn().mockResolvedValue(mockResponse),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [{ provide: SubscriptionService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<SubscriptionController>(SubscriptionController)
  })

  it('create() should create a subscription', async () => {
    const dto: CreateSubscriptionDto = {
      companyId: 'company-1',
      planId: 'plan-1',
      subscriptionStatusId: 'status-1',
    }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockResponse)
  })

  it('getAll() should return paginated subscriptions', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await controller.getAll(query)
    expect(mockService.getAll).toHaveBeenCalledWith(query)
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination.total).toBe(1)
  })

  it('getById() should return a subscription by id', async () => {
    const result = await controller.getById('sub-1')
    expect(mockService.getById).toHaveBeenCalledWith('sub-1')
    expect(result).toEqual(mockResponse)
  })

  it('getActiveByCompany() should return the active subscription for a company', async () => {
    const result = await controller.getActiveByCompany('company-1')
    expect(mockService.getActiveByCompany).toHaveBeenCalledWith('company-1')
    expect(result).toEqual(mockResponse)
  })

  it('activate() should activate a subscription', async () => {
    const dto: ActivateSubscriptionDto = {
      subscriptionStatusId: 'status-active',
    }
    const result = await controller.activate('sub-1', dto)
    expect(mockService.activate).toHaveBeenCalledWith('sub-1', dto)
    expect(result).toEqual(mockResponse)
  })

  it('cancel() should cancel a subscription', async () => {
    const dto: CancelSubscriptionDto = {
      subscriptionStatusId: 'status-cancelled',
    }
    const req = { user: { role: GlobalRole.ADMIN, sub: 'admin-1' } } as any
    const result = await controller.cancel(req, 'sub-1', dto)
    expect(mockService.cancel).toHaveBeenCalledWith('sub-1', dto, undefined)
    expect(result).toEqual(mockResponse)
  })

  it('changePlan() should change the plan of a subscription', async () => {
    const dto: ChangePlanDto = { planId: 'plan-2' }
    const req = { user: { role: GlobalRole.ADMIN, sub: 'admin-1' } } as any
    const result = await controller.changePlan(req, 'sub-1', dto)
    expect(mockService.changePlan).toHaveBeenCalledWith('sub-1', dto, undefined)
    expect(result).toEqual(mockResponse)
  })

  it('delete() should delete a subscription', async () => {
    const result = await controller.delete('sub-1')
    expect(mockService.delete).toHaveBeenCalledWith('sub-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
