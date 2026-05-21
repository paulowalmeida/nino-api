import { Injectable } from '@nestjs/common'

import { CustomerTenant } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CustomerTenantRepository } from './customer-tenant.repository'
import { CreateCustomerTenantDto } from './dtos/create-customer-tenant.dto'
import { CustomerTenantPaginatedResponse } from './types/customer-tenant-paginated-response.type'

type CreateData = CreateCustomerTenantDto & { customerId: string }

@Injectable()
export class CustomerTenantService {
  constructor(private readonly repo: CustomerTenantRepository) {}

  async getAll(
    customerId: string,
    query: PaginatedQueryDto,
  ): Promise<CustomerTenantPaginatedResponse> {
    return this.repo.findAllPaginated<CustomerTenant>({
      where: { customerId },
      order: { 
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc'
      },
      page: query.page,
      size: query.size,
    })
  }

  async create(data: CreateData): Promise<CustomerTenant> {
    return this.repo.insert<CreateData, CustomerTenant>({ data })
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
