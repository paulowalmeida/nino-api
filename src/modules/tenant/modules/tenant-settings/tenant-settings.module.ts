import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { TenantSettingsController } from './tenant-settings.controller'
import { TenantSettingsRepository } from './tenant-settings.repository'
import { TenantSettingsService } from './tenant-settings.service'

@Module({
  controllers: [TenantSettingsController],
  providers: [TenantSettingsService, TenantSettingsRepository, ErrorService],
  exports: [TenantSettingsService],
})
export class TenantSettingsModule {}
