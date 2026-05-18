import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { TenantTypeController } from './tenant-type.controller'
import { TenantTypeRepository } from './tenant-type.repository'
import { TenantTypeService } from './tenant-type.service'

@Module({
  controllers: [TenantTypeController],
  providers: [TenantTypeService, TenantTypeRepository, ErrorService],
  exports: [TenantTypeService],
})
export class TenantTypeModule {}
