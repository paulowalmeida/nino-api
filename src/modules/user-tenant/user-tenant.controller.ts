import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantResponse } from './types/user-tenant.response.type'
import { UserTenantService } from './user-tenant.service'

@Controller('user-tenants')
@UseGuards(JwtAuthGuard)
export class UserTenantController {
  constructor(private readonly service: UserTenantService) {}

  @Post()
  async create(@Body() body: CreateUserTenantDto): Promise<UserTenantResponse> {
    return this.service.create(body)
  }

  @Get('user/:userId')
  async getByUserId(
    @Param('userId') userId: string,
  ): Promise<UserTenantResponse[]> {
    return this.service.getByUserId(userId)
  }

  @Get('tenant/:tenantId')
  async getByTenantId(
    @Param('tenantId') tenantId: string,
  ): Promise<UserTenantResponse[]> {
    return this.service.getByTenantId(tenantId)
  }

  @Delete(':userId/:tenantId')
  async delete(
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
  ): Promise<{ message: string }> {
    return this.service.delete(userId, tenantId)
  }
}
