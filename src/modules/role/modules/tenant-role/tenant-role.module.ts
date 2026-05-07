import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { TenantRoleController } from './tenant-role.controller'
import { TenantRoleRepository } from './tenant-role.repository'
import { TenantRoleService } from './tenant-role.service'

@Module({
  controllers: [TenantRoleController],
  providers: [TenantRoleService, TenantRoleRepository, ErrorService],
  exports: [TenantRoleService],
})
export class TenantRoleModule {}
