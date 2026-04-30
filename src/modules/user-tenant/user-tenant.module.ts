import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { Credential } from '@credential/entities/credential.entity'
import { UserTenant } from '@user/entities/user-tenant.entity'
import { UserTenantController } from './user-tenant.controller'
import { UserTenantRepository } from './user-tenant.repository'
import { UserTenantService } from './user-tenant.service'

@Module({
  imports: [TypeOrmModule.forFeature([UserTenant, Credential])],
  controllers: [UserTenantController],
  providers: [UserTenantService, UserTenantRepository, ErrorService, PaginationService],
  exports: [UserTenantService],
})
export class UserTenantModule {}
