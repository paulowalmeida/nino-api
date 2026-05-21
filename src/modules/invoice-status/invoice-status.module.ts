import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { InvoiceStatusController } from './invoice-status.controller'

@Module({
  imports: [CommonModule.forFeature('invoiceStatus', 'Invoice Status')],
  controllers: [InvoiceStatusController],
})
export class InvoiceStatusModule {}
