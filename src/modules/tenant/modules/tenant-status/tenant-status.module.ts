import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { TenantStatusController } from './tenant-status.controller'
import { TenantStatusRepository } from './tenant-status.repository'
import { TenantStatusService } from './tenant-status.service'

@Module({
  controllers: [TenantStatusController],
  providers: [TenantStatusService, TenantStatusRepository, ErrorService],
  exports: [TenantStatusService],
})
export class TenantStatusModule {}
