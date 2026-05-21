import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { TenantRoleController } from './tenant-role.controller'

@Module({
  imports: [CommonModule.forFeature('tenantRole', 'Tenant Role')],
  controllers: [TenantRoleController],
})
export class TenantRoleModule {}
