import { Module } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { TenantStatusController } from './tenant-status.controller'
import { TenantStatusRepository } from './tenant-status.repository'
import { TenantStatusService } from './tenant-status.service'

@Module({
  controllers: [TenantStatusController],
  providers: [
    TenantStatusService,
    TenantStatusRepository,
    PrismaService,
    PrismaErrorService,
  ],
  exports: [TenantStatusService],
})
export class TenantStatusModule {}
