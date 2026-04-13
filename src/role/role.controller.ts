import { Controller, Get, Param, UseGuards } from '@nestjs/common'

import { Role } from '@role/types/role.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RoleService } from './role.service'

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
  async getById(@Param('id') id: number): Promise<Role> {
    return await this.roleService.getById(id)
  }
}
