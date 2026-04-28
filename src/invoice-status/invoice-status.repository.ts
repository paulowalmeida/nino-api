import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { InvoiceStatus } from '@invoice-status/entities/invoice-status.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CreateInvoiceStatusDto } from './dtos/create-invoice-status.dto'
import { UpdateInvoiceStatusDto } from './dtos/update-invoice-status.dto'

@Injectable()
export class InvoiceStatusRepository {
  constructor(
    @InjectRepository(InvoiceStatus)
    private readonly repository: Repository<InvoiceStatus>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<InvoiceStatus[]> {
    try {
      return await this.repository.find({ order: { name: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<InvoiceStatus> {
    try {
      const found = await this.repository.findOneBy({ id })
      if (!found) throw new NotFoundException('Invoice Status not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateInvoiceStatusDto): Promise<InvoiceStatus> {
    try {
      const exists = await this.repository.findOneBy({ name: data.name })
      if (exists) throw new ConflictException('Name already exists')

      const invoiceStatus = this.repository.create(data)
      return await this.repository.save(invoiceStatus)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateInvoiceStatusDto): Promise<InvoiceStatus> {
    try {
      const invoiceStatus = await this.getById(id)

      if (data.name && data.name !== invoiceStatus.name) {
        const exists = await this.repository.findOneBy({ name: data.name })
        if (exists) throw new ConflictException('Name already exists')
      }

      Object.assign(invoiceStatus, data)
      return await this.repository.save(invoiceStatus)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.delete(id)
      return { message: 'Invoice Status deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
