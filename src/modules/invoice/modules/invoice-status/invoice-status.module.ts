import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { InvoiceStatusController } from './invoice-status.controller'
import { InvoiceStatusRepository } from './invoice-status.repository'
import { InvoiceStatusService } from './invoice-status.service'

@Module({
  controllers: [InvoiceStatusController],
  providers: [InvoiceStatusService, InvoiceStatusRepository, ErrorService],
  exports: [InvoiceStatusService],
})
export class InvoiceStatusModule {}
