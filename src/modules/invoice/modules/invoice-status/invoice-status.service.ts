import { Injectable } from '@nestjs/common'

import { InvoiceStatus } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CreateInvoiceStatusDto } from './dtos/create-invoice-status.dto'
import { UpdateInvoiceStatusDto } from './dtos/update-invoice-status.dto'
import { InvoiceStatusRepository } from './invoice-status.repository'

@Injectable()
export class InvoiceStatusService extends BaseService<
  InvoiceStatus,
  CreateInvoiceStatusDto,
  UpdateInvoiceStatusDto
> {
  constructor(repo: InvoiceStatusRepository) {
    super(repo)
  }
}
