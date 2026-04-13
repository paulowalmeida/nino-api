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
import { Throttle } from '@nestjs/throttler'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { UpdatePreferencesDTO } from '@user/dto/user-update-preferences.dto'
import { UpdateRoleDTO } from '@user/dto/user-update-role.dto'
import { NewUserDTO } from '@user/new-user.dto'
import type { UserTokenData } from '@user/types/user-token.data.type'
import { User } from '@user/types/user.type'
import { UserService } from '@user/user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Throttle({ default: { ttl: 3600000, limit: 5 } })
  @Post()
  async create(@Body() payload: NewUserDTO): Promise<User> {
    return await this.userService.create(payload)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listAll(): Promise<User[]> {
    return await this.userService.listAll()
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<User> {
    return await this.userService.getById(id)
  }

  // @Get(':id/login-history')
  // @UseGuards(JwtAuthGuard)
  // async getLoginHistory(
  //   @Param('id') id: string,
  //   @Query('limit') limit?: number,
  // ): Promise<any> {
  //   return await this.userService.getLoginHistory(id, limit)
  // }

  @Patch(':id/preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(
    @Param('id') id: string,
    @Body() payload: UpdatePreferencesDTO,
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
    @Body() payload: UpdateRoleDTO,
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
