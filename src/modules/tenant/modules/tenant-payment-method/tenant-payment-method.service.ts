import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CreateTenantPaymentMethodDto } from './dtos/create-tenant-payment-method.dto'
import { UpdateTenantPaymentMethodDto } from './dtos/update-tenant-payment-method.dto'
import { TenantPaymentMethodRepository } from './tenant-payment-method.repository'
import { TenantPaymentMethodFull } from './types/tenant-payment-method-full.type'
import { TenantPaymentMethodPaginatedResponse } from './types/tenant-payment-method-paginated-response.type'
import { TenantPaymentMethodResponse } from './types/tenant-payment-method-response.type'

@Injectable()
export class TenantPaymentMethodService {
  private readonly include = { method: true } as const

  constructor(private readonly repo: TenantPaymentMethodRepository) {}

  private toResponse(
    item: TenantPaymentMethodFull,
  ): TenantPaymentMethodResponse {
    const { methodId: _, deletedAt: __, method, ...rest } = item
    return {
      ...rest,
      method: { name: method.name, description: method.description },
    }
  }

  async getAll(
    tenantId: string,
    query: PaginatedQueryDto,
  ): Promise<TenantPaymentMethodPaginatedResponse> {
    const result = await this.repo.findAllPaginated<TenantPaymentMethodFull>({
      where: { tenantId },
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      include: this.include,
      page: query.page,
      size: query.size,
    })
    return { ...result, data: result.data.map((i) => this.toResponse(i)) }
  }

  async create(
    tenantId: string,
    data: CreateTenantPaymentMethodDto,
  ): Promise<TenantPaymentMethodResponse> {
    const item = await this.repo.insert<
      CreateTenantPaymentMethodDto & { tenantId: string },
      TenantPaymentMethodFull
    >({ data: { ...data, tenantId }, include: this.include })
    return this.toResponse(item)
  }

  async update(
    tenantId: string,
    methodId: string,
    data: UpdateTenantPaymentMethodDto,
  ): Promise<TenantPaymentMethodResponse> {
    const item = await this.repo.updateItem<
      UpdateTenantPaymentMethodDto,
      TenantPaymentMethodFull
    >({
      where: { tenantId_methodId: { tenantId, methodId } },
      data,
      include: this.include,
    })
    return this.toResponse(item)
  }

  async delete(
    tenantId: string,
    methodId: string,
  ): Promise<{ message: string }> {
    return this.repo.softDelete({ tenantId_methodId: { tenantId, methodId } })
  }
}
