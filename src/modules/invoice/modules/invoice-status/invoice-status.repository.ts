import { Injectable } from '@nestjs/common'

import { InvoiceStatus, Prisma } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateInvoiceStatusDto } from './dtos/create-invoice-status.dto'
import { UpdateInvoiceStatusDto } from './dtos/update-invoice-status.dto'

@Injectable()
export class InvoiceStatusRepository
  extends BaseRepository<Prisma.InvoiceStatusDelegate>
  implements IBaseLookupRepository<
    InvoiceStatus,
    CreateInvoiceStatusDto,
    UpdateInvoiceStatusDto
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.invoiceStatus, 'Invoice Status')
  }

  async getAll(): Promise<InvoiceStatus[]> {
    return this.findAll<InvoiceStatus>({ orderBy: { name: 'asc' } })
  }

  async getById(id: string): Promise<InvoiceStatus> {
    return this.findItem<InvoiceStatus>({ where: { id } })
  }

  async create(data: CreateInvoiceStatusDto): Promise<InvoiceStatus> {
    return this.insert<CreateInvoiceStatusDto, InvoiceStatus>({ data })
  }

  async update(
    id: string,
    data: UpdateInvoiceStatusDto,
  ): Promise<InvoiceStatus> {
    return this.updateItem<UpdateInvoiceStatusDto, InvoiceStatus>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
