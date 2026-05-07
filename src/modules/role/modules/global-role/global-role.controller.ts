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

import { GlobalRole } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole as GlobalRoleEnum } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateGlobalRoleDto } from './dtos/create-global-role.dto'
import { UpdateGlobalRoleDto } from './dtos/update-global-role.dto'
import { GlobalRoleService } from './global-role.service'

@Controller('global-roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GlobalRoleController {
  constructor(private service: GlobalRoleService) {}

  @Get()
  @Roles(GlobalRoleEnum.ADMIN, GlobalRoleEnum.SUPPORT)
  async getAll(): Promise<GlobalRole[]> {
    return this.service.getAll()
  }

  @Get(':id')
  @Roles(GlobalRoleEnum.ADMIN, GlobalRoleEnum.SUPPORT)
  async getById(@Param('id') id: string): Promise<GlobalRole> {
    return this.service.getById(id)
  }

  @Post()
  @Roles(GlobalRoleEnum.ADMIN)
  async create(@Body() body: CreateGlobalRoleDto): Promise<GlobalRole> {
    return this.service.create(body)
  }

  @Put(':id')
  @Roles(GlobalRoleEnum.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateGlobalRoleDto,
  ): Promise<GlobalRole> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @Roles(GlobalRoleEnum.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
