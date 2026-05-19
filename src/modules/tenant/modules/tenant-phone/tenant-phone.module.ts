import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { TenantPhoneController } from './tenant-phone.controller'
import { TenantPhoneRepository } from './tenant-phone.repository'
import { TenantPhoneService } from './tenant-phone.service'

@Module({
  controllers: [TenantPhoneController],
  providers: [TenantPhoneService, TenantPhoneRepository, ErrorService],
  exports: [TenantPhoneService],
})
export class TenantPhoneModule {}
