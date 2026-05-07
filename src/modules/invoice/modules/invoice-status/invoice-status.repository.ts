import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { InvoiceStatus } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateInvoiceStatusDto } from './dtos/create-invoice-status.dto'
import { UpdateInvoiceStatusDto } from './dtos/update-invoice-status.dto'

@Injectable()
export class InvoiceStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<InvoiceStatus[]> {
    try {
      return await this.prisma.invoiceStatus.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<InvoiceStatus> {
    try {
      const found = await this.prisma.invoiceStatus.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found) throw new NotFoundException('Invoice Status not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateInvoiceStatusDto): Promise<InvoiceStatus> {
    try {
      const exists = await this.prisma.invoiceStatus.findFirst({
        where: { name: data.name, deletedAt: null },
      })
      if (exists) throw new ConflictException('Name already exists')
      return await this.prisma.invoiceStatus.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(
    id: string,
    data: UpdateInvoiceStatusDto,
  ): Promise<InvoiceStatus> {
    try {
      const item = await this.getById(id)
      if (data.name && data.name !== item.name) {
        const exists = await this.prisma.invoiceStatus.findFirst({
          where: { name: data.name, deletedAt: null },
        })
        if (exists) throw new ConflictException('Name already exists')
      }
      return await this.prisma.invoiceStatus.update({ where: { id }, data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.invoiceStatus.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Invoice Status deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
