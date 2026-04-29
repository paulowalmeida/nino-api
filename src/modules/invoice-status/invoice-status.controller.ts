import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'

import { CreateInvoiceStatusDto } from './dtos/create-invoice-status.dto'
import { UpdateInvoiceStatusDto } from './dtos/update-invoice-status.dto'
import { InvoiceStatus } from './entities/invoice-status.entity'
import { InvoiceStatusService } from './invoice-status.service'

@Controller('invoice-statuses')
@UseGuards(JwtAuthGuard)
export class InvoiceStatusController {
  constructor(private service: InvoiceStatusService) {}

  @Get()
  getAll(): Promise<InvoiceStatus[]> {
    return this.service.getAll()
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<InvoiceStatus> {
    return this.service.getById(id)
  }

  @Post()
  create(@Body() body: CreateInvoiceStatusDto): Promise<InvoiceStatus> {
    return this.service.create(body)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateInvoiceStatusDto,
  ): Promise<InvoiceStatus> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
