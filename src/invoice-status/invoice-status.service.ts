import { Injectable } from '@nestjs/common'

import { CreateInvoiceStatusDto } from './dtos/create-invoice-status.dto'
import { UpdateInvoiceStatusDto } from './dtos/update-invoice-status.dto'
import { InvoiceStatusRepository } from './invoice-status.repository'
import { InvoiceStatus } from './types/invoice-status.type'

@Injectable()
export class InvoiceStatusService {
  constructor(private repo: InvoiceStatusRepository) {}

  async getAll(): Promise<InvoiceStatus[]> {
    return await this.repo.getAll()
  }

  async getById(id: string): Promise<InvoiceStatus> {
    return await this.repo.getById(id)
  }

  async create(data: CreateInvoiceStatusDto): Promise<InvoiceStatus> {
    return this.repo.create(data)
  }

  async update(
    id: string,
    data: UpdateInvoiceStatusDto,
  ): Promise<InvoiceStatus> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
