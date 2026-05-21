import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { TenantStatusController } from './tenant-status.controller'

@Module({
  imports: [CommonModule.forFeature('tenantStatus', 'Tenant Status')],
  controllers: [TenantStatusController],
})
export class TenantStatusModule {}
