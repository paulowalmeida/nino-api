import { Controller, Get, Param, UseGuards } from '@nestjs/common'

import { RoleService } from './role.service'
import { Role } from './types/role.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(): Promise<Role[]> {
    return await this.roleService.getAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<Role> {
    return await this.roleService.getById(id)
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  async getByCode(@Param('code') code: string): Promise<Role> {
    return await this.roleService.getByCode(Number(code))
  }
}
