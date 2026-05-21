import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerTenantController } from './customer-tenant.controller'
import { CustomerTenantRepository } from './customer-tenant.repository'
import { CustomerTenantService } from './customer-tenant.service'

@Module({
  controllers: [CustomerTenantController],
  providers: [
    CustomerTenantService,
    CustomerTenantRepository,
    CustomerOwnerGuard,
    ErrorService,
  ],
  exports: [CustomerTenantService],
})
export class CustomerTenantModule {}
