import { PartialType } from '@nestjs/mapped-types'

import { CreateInvoiceStatusDto } from './create-invoice-status.dto'

export class UpdateInvoiceStatusDto extends PartialType(
  CreateInvoiceStatusDto,
) {}
