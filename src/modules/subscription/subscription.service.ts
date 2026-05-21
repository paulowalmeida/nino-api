import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { SubscriptionRepository } from './subscription.repository'
import { ActivateSubscriptionDto } from './dtos/activate-subscription.dto'
import { CancelSubscriptionDto } from './dtos/cancel-subscription.dto'
import { ChangePlanDto } from './dtos/change-plan.dto'
import { CreateSubscriptionDto } from './dtos/create-subscription.dto'
import { SubscriptionFull } from './types/subscription-full.type'
import { SubscriptionPaginatedResponse } from './types/subscription-paginated-response.type'
import { SubscriptionResponse } from './types/subscription-response.type'
import { SubscriptionCreateData } from './types/subscription-create-data.type'
import { SubscriptionActivateData } from './types/subscription-activate-data.type'
import { SubscriptionCancelData } from './types/subscription-cancel-data.type'

@Injectable()
export class SubscriptionService {
  private readonly include = {
    plan: true,
    subscriptionStatus: true,
  } as const

  constructor(private readonly repo: SubscriptionRepository) {}

  private toResponse(item: SubscriptionFull): SubscriptionResponse {
    const { planId: _, subscriptionStatusId: __, deletedAt: _d, ...rest } = item
    return rest
  }

  async getAll(
    params?: PaginatedQueryDto,
  ): Promise<SubscriptionPaginatedResponse> {
    const result = await this.repo.findAllPaginated<SubscriptionFull>({
      page: params?.page,
      size: params?.size,
      order: {
        target: params?.target ?? 'createdAt',
        direction: params?.direction ?? 'desc',
      },
      include: this.include,
    })
    return { ...result, data: result.data.map((i) => this.toResponse(i)) }
  }

  async getById(id: string): Promise<SubscriptionResponse> {
    const item = await this.repo.findItem<SubscriptionFull>({
      where: { id },
      include: this.include,
    })
    return this.toResponse(item)
  }

  async getActiveByCompany(companyId: string): Promise<SubscriptionResponse> {
    const item = await this.repo.findItem<SubscriptionFull>({
      where: { companyId, isActive: true },
      include: this.include,
    })
    return this.toResponse(item)
  }

  async create(dto: CreateSubscriptionDto): Promise<SubscriptionResponse> {
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 30)
    const item = await this.repo.insert<
      SubscriptionCreateData,
      SubscriptionFull
    >({
      data: {
        companyId: dto.companyId,
        planId: dto.planId,
        subscriptionStatusId: dto.subscriptionStatusId,
        isActive: true,
        trialEndsAt,
      },
      include: this.include,
    })
    return this.toResponse(item)
  }

  async activate(
    id: string,
    dto: ActivateSubscriptionDto,
  ): Promise<SubscriptionResponse> {
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)
    const item = await this.repo.updateItem<
      SubscriptionActivateData,
      SubscriptionFull
    >({
      where: { id },
      data: {
        subscriptionStatusId: dto.subscriptionStatusId,
        trialEndsAt: null,
        expiresAt,
      },
      include: this.include,
    })
    return this.toResponse(item)
  }

  async cancel(
    id: string,
    dto: CancelSubscriptionDto,
  ): Promise<SubscriptionResponse> {
    const item = await this.repo.updateItem<
      SubscriptionCancelData,
      SubscriptionFull
    >({
      where: { id },
      data: { subscriptionStatusId: dto.subscriptionStatusId, isActive: null },
      include: this.include,
    })
    return this.toResponse(item)
  }

  async changePlan(
    id: string,
    dto: ChangePlanDto,
  ): Promise<SubscriptionResponse> {
    const item = await this.repo.updateItem<ChangePlanDto, SubscriptionFull>({
      where: { id },
      data: dto,
      include: this.include,
    })
    return this.toResponse(item)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
