import { Module } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { InvoiceStatusController } from './invoice-status.controller'
import { InvoiceStatusRepository } from './invoice-status.repository'
import { InvoiceStatusService } from './invoice-status.service'

@Module({
  controllers: [InvoiceStatusController],
  providers: [
    InvoiceStatusService,
    InvoiceStatusRepository,
    PrismaService,
    PrismaErrorService,
  ],
  exports: [InvoiceStatusService],
})
export class InvoiceStatusModule {}
