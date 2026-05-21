import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { TenantTypeController } from './tenant-type.controller'

@Module({
  imports: [CommonModule.forFeature('tenantType', 'Tenant Type')],
  controllers: [TenantTypeController],
})
export class TenantTypeModule {}
