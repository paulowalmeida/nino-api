import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { Role } from '@shared/enums/role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreateInvoiceStatusDto } from './dtos/create-invoice-status.dto'
import { UpdateInvoiceStatusDto } from './dtos/update-invoice-status.dto'
import { InvoiceStatus } from './entities/invoice-status.entity'
import { InvoiceStatusService } from './invoice-status.service'

@Controller('invoice-statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceStatusController {
  constructor(private service: InvoiceStatusService) {}

  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  @Get()
  getAll(): Promise<InvoiceStatus[]> {
    return this.service.getAll()
  }

  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  @Get(':id')
  getById(@Param('id') id: string): Promise<InvoiceStatus> {
    return this.service.getById(id)
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateInvoiceStatusDto): Promise<InvoiceStatus> {
    return this.service.create(body)
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateInvoiceStatusDto,
  ): Promise<InvoiceStatus> {
    return this.service.update(id, body)
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
