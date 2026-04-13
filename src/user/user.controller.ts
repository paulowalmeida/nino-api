import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import type { AuthRequest } from '@shared/types/account-auth-request.type'
import { User } from '@user/types/user/user-repository.type'
import { UserDto } from './user.dto'
import { UserService } from './user.service'

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getList(): Promise<User[]> {
    return await this.userService.getList()
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<User> {
    return await this.userService.getById(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: AuthRequest, @Body() body: UserDto): Promise<User> {
    return await this.userService.create(req.account.sub, body)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: UserDto): Promise<User> {
    return await this.userService.update(id, body)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.delete(id)
    return { message: 'User deleted' }
  }
}
