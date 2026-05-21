import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CustomerTenantRepository } from './customer-tenant.repository'
import { CreateCustomerTenantDto } from './dtos/create-customer-tenant.dto'
import { CustomerTenantFull } from './types/customer-tenant-full.type'
import { CustomerTenantPaginatedResponse } from './types/customer-tenant-paginated-response.type'
import { CustomerTenantResponse } from './types/customer-tenant-response.type'

type CreateData = CreateCustomerTenantDto & { customerId: string }

@Injectable()
export class CustomerTenantService {
  private readonly include = { tenant: true } as const

  constructor(private readonly repo: CustomerTenantRepository) {}

  private toResponse(ct: CustomerTenantFull): CustomerTenantResponse {
    const { customerId: _, tenantId: __, ...rest } = ct
    return rest
  }

  async getAll(
    customerId: string,
    query: PaginatedQueryDto,
  ): Promise<CustomerTenantPaginatedResponse> {
    const result = await this.repo.findAllPaginated<CustomerTenantFull>({
      where: { customerId },
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      page: query.page,
      size: query.size,
      include: this.include,
    })
    return { ...result, data: result.data.map((ct) => this.toResponse(ct)) }
  }

  async create(data: CreateData): Promise<CustomerTenantResponse> {
    const ct = await this.repo.insert<CreateData, CustomerTenantFull>({
      data,
      include: this.include,
    })
    return this.toResponse(ct)
  }

  async delete(
    customerId: string,
    tenantId: string,
  ): Promise<{ message: string }> {
    return this.repo.softDelete({
      customerId_tenantId: { customerId, tenantId },
    })
  }
}
