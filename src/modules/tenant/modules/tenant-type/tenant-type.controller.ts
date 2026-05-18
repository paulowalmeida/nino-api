import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'

import { TenantType } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateTenantTypeDto } from './dtos/create-tenant-type.dto'
import { UpdateTenantTypeDto } from './dtos/update-tenant-type.dto'
import { TenantTypeService } from './tenant-type.service'

@Controller('tenant-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantTypeController {
  constructor(private service: TenantTypeService) {}

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get()
  async getAll(): Promise<TenantType[]> {
    return this.service.getAll()
  }

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get(':id')
  async getById(@Param('id') id: string): Promise<TenantType> {
    return this.service.getById(id)
  }

  @Roles(GlobalRole.ADMIN)
  @Post()
  async create(@Body() body: CreateTenantTypeDto): Promise<TenantType> {
    return this.service.create(body)
  }

  @Roles(GlobalRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTenantTypeDto,
  ): Promise<TenantType> {
    return this.service.update(id, body)
  }

  @Roles(GlobalRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
