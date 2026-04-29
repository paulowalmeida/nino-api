import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { Role as RoleEnum } from '@shared/enums/role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateRoleDto } from './dtos/create-role.dto'
import { UpdateRoleDto } from './dtos/update-role.dto'
import { Role } from './entities/role.entity'
import { RoleService } from './role.service'

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private service: RoleService) {}

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPPORT, RoleEnum.MERCHANT)
  async getAll(): Promise<Role[]> {
    return this.service.getAll()
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPPORT, RoleEnum.MERCHANT)
  async getById(@Param('id') id: string): Promise<Role> {
    return this.service.getById(id)
  }

  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(@Body() body: CreateRoleDto): Promise<Role> {
    return this.service.create(body)
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
  ): Promise<Role> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
