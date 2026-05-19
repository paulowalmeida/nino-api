import { Injectable } from '@nestjs/common'

import { CustomerTenant, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CreateCustomerTenantDto } from './dtos/create-customer-tenant.dto'

@Injectable()
export class CustomerTenantRepository
  extends BaseRepository<Prisma.CustomerTenantDelegate> {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.customerTenant, 'Customer Tenant')
  }

  async getAll(customerId: string): Promise<CustomerTenant[]> {
    return this.findAll<CustomerTenant>({ where: { customerId } })
  }

  async create(
    data: CreateCustomerTenantDto & { customerId: string },
  ): Promise<CustomerTenant> {
    return this.insert<
      CreateCustomerTenantDto & { customerId: string },
      CustomerTenant
    >({ data })
  }

  async delete(
    customerId: string,
    tenantId: string,
  ): Promise<{ message: string }> {
    return this.updateItem<{ deletedAt: Date }, { message: string }>({
      where: { customerId_tenantId: { customerId, tenantId } },
      data: { deletedAt: new Date() },
    }).then(() => ({ message: 'Deleted successfully' }))
  }
}
