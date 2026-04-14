import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { UserUpdatePreferencesDTO } from '@user/dto/user-update-preferences.dto'
import { UserUpdateRoleDTO } from '@user/dto/user-update-role.dto'
import { UserDTO } from '@user/dto/user.dto'
import type { UserTokenData } from '@user/types/user-token.data.type'
import { User } from '@user/types/user.type'
import { UserService } from '@user/user.service'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Throttle({ default: { ttl: 3600000, limit: 5 } })
  @Post()
  async create(@Body() payload: UserDTO): Promise<User> {
    return await this.userService.create(payload)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(): Promise<User[]> {
    return await this.userService.list()
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: UserTokenData): Promise<User> {
    return await this.userService.getByEmail(req.email)
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  async getByEmail(@Param('email') email: string): Promise<User> {
    return await this.userService.getByEmail(email)
  }

  @Get('cnpj/:cnpj')
  @UseGuards(JwtAuthGuard)
  async getByCnpj(@Param('cnpj') cnpj: string): Promise<User> {
    return await this.userService.getByCnpj(cnpj)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<User> {
    return await this.userService.getById(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() payload: UserDTO,
  ): Promise<User> {
    return await this.userService.update(id, payload)
  }

  @Patch(':id/preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(
    @Param('id') id: string,
    @Body() payload: UserUpdatePreferencesDTO,
  ): Promise<User> {
    return await this.userService.updatePreferences(
      id,
      payload.locale,
      payload.timezone,
    )
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  async updateRole(
    @Param('id') id: string,
    @Body() payload: UserUpdateRoleDTO,
  ): Promise<User> {
    return await this.userService.updateRole(id, payload.roleId)
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivate(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.deactivate(id)
    return { message: 'User deactivated' }
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  async activate(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.activate(id)
    return { message: 'User activated' }
  }
}
