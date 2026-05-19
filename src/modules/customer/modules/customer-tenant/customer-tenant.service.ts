import { Injectable } from '@nestjs/common'

import { CustomerTenant } from '@prisma/client'

import { CreateCustomerTenantDto } from './dtos/create-customer-tenant.dto'
import { CustomerTenantRepository } from './customer-tenant.repository'

@Injectable()
export class CustomerTenantService {
  constructor(private readonly repo: CustomerTenantRepository) {}

  async getAll(customerId: string): Promise<CustomerTenant[]> {
    return this.repo.getAll(customerId)
  }

  async create(
    data: CreateCustomerTenantDto & { customerId: string },
  ): Promise<CustomerTenant> {
    return this.repo.create(data)
  }

  async delete(
    customerId: string,
    tenantId: string,
  ): Promise<{ message: string }> {
    return this.repo.delete(customerId, tenantId)
  }
}
