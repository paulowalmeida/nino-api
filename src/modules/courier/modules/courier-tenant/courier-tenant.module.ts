import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { CourierTenantController } from './courier-tenant.controller'
import { CourierTenantRepository } from './courier-tenant.repository'
import { CourierTenantService } from './courier-tenant.service'

@Module({
  controllers: [CourierTenantController],
  providers: [
    CourierTenantService,
    CourierTenantRepository,
    ErrorService,
    PaginationService,
  ],
  exports: [CourierTenantService],
})
export class CourierTenantModule {}
