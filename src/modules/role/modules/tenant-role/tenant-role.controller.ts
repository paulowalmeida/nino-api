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

import { TenantRole } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateTenantRoleDto } from './dtos/create-tenant-role.dto'
import { UpdateTenantRoleDto } from './dtos/update-tenant-role.dto'
import { TenantRoleService } from './tenant-role.service'

@Controller('tenant-roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantRoleController {
  constructor(private service: TenantRoleService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getAll(): Promise<TenantRole[]> {
    return this.service.getAll()
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getById(@Param('id') id: string): Promise<TenantRole> {
    return this.service.getById(id)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async create(@Body() body: CreateTenantRoleDto): Promise<TenantRole> {
    return this.service.create(body)
  }

  @Put(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTenantRoleDto,
  ): Promise<TenantRole> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
