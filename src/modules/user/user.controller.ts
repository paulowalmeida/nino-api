import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UserResponse } from './types/user.type'
import { UserService } from './user.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createDto: CreateUserDto): Promise<UserResponse> {
    return await this.userService.create(createDto)
  }

  @Get()
  async getAll(): Promise<UserResponse[]> {
    return await this.userService.getAll()
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserResponse> {
    return await this.userService.getById(id)
  }

  @Get('company/:companyId')
  async getByCompanyId(
    @Param('companyId') companyId: string,
  ): Promise<UserResponse[]> {
    return await this.userService.getByCompanyId(companyId)
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserResponse> {
    await this.userService.update(id, updateDto)
    return await this.userService.getById(id)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.delete(id)
    return { message: 'user deleted successfully' }
  }
}
