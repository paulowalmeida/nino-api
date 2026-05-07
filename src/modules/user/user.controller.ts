import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UserQueryDto } from './dtos/user-query.dto'
import { UserPaginatedResponse } from './types/user-paginated-response.type'
import { UserResponse } from './types/user-response.type'
import { UserService } from './user.service'

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(GlobalRole.ADMIN)
  async create(@Body() createDto: CreateUserDto): Promise<UserResponse> {
    return await this.userService.create(createDto)
  }

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async getAll(@Query() query: UserQueryDto): Promise<UserPaginatedResponse> {
    return await this.userService.getAll(query)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getById(@Param('id') id: string): Promise<UserResponse> {
    return await this.userService.getById(id)
  }

  @Get('company/:companyId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getByCompanyId(
    @Param('companyId') companyId: string,
  ): Promise<UserResponse[]> {
    return await this.userService.getByCompanyId(companyId)
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserResponse> {
    await this.userService.update(id, updateDto)
    return await this.userService.getById(id)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.delete(id)
    return { message: 'user deleted successfully' }
  }
}
