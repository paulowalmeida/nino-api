import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { TenantStatus } from '@tenant-status/entities/tenant-status.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { TenantStatusController } from './tenant-status.controller'
import { TenantStatusRepository } from './tenant-status.repository'
import { TenantStatusService } from './tenant-status.service'

@Module({
  imports: [TypeOrmModule.forFeature([TenantStatus])],
  controllers: [TenantStatusController],
  providers: [TenantStatusService, TenantStatusRepository, ErrorService],
  exports: [TenantStatusService],
})
export class TenantStatusModule {}
