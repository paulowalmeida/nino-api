import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { InvoiceStatus } from './types/invoice-status.type'
import { CreateInvoiceStatusDto } from './dtos/create-invoice-status.dto'
import { UpdateInvoiceStatusDto } from './dtos/update-invoice-status.dto'

@Injectable()
export class InvoiceStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async getAll(): Promise<InvoiceStatus[]> {
    try {
      return await this.prisma.invoiceStatus.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<InvoiceStatus> {
    try {
      const found = await this.prisma.invoiceStatus.findUnique({
        where: { id },
      })

      if (!found) throw new NotFoundException('Invoice Status not found')

      return found
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async create(data: CreateInvoiceStatusDto): Promise<InvoiceStatus> {
    try {
      const existsByName = await this.prisma.invoiceStatus.findUnique({
        where: { name: data.name },
      })
      if (existsByName) throw new ConflictException('Name already exists')

      return await this.prisma.invoiceStatus.create({ data })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, data: UpdateInvoiceStatusDto): Promise<InvoiceStatus> {
    try {
      if (data.name) {
        const found = await this.prisma.invoiceStatus.findUnique({
          where: { name: data.name },
        })

        if (found && found.id !== id) {
          throw new ConflictException('Name already exists')
        }
      }

      return await this.prisma.invoiceStatus.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.invoiceStatus.delete({ where: { id } })
      return { message: 'Invoice Status deleted successfully' }
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
