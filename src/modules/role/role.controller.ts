import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'

import { CreateRoleDto } from './dtos/create-role.dto'
import { UpdateRoleDto } from './dtos/update-role.dto'
import { Role } from './entities/role.entity'
import { RoleService } from './role.service'

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private service: RoleService) {}

  @Get()
  async getAll(): Promise<Role[]> {
    return this.service.getAll()
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Role> {
    return this.service.getById(id)
  }

  @Post()
  async create(@Body() body: CreateRoleDto): Promise<Role> {
    return this.service.create(body)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
  ): Promise<Role> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
