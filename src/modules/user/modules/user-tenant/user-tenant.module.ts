import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import {
  PaginationService,
} from '@shared/services/pagination/pagination.service'
import { UserTenantController } from './user-tenant.controller'
import { UserTenantRepository } from './user-tenant.repository'
import { UserTenantService } from './user-tenant.service'

@Module({
  controllers: [UserTenantController],
  providers: [
    UserTenantService,
    UserTenantRepository,
    ErrorService,
    PaginationService,
  ],
  exports: [UserTenantService],
})
export class UserTenantModule {}
