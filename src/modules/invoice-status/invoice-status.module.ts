import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { InvoiceStatus } from './entities/invoice-status.entity'
import { InvoiceStatusController } from './invoice-status.controller'
import { InvoiceStatusRepository } from './invoice-status.repository'
import { InvoiceStatusService } from './invoice-status.service'

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceStatus])],
  controllers: [InvoiceStatusController],
  providers: [InvoiceStatusService, InvoiceStatusRepository, ErrorService],
  exports: [InvoiceStatusService],
})
export class InvoiceStatusModule {}
