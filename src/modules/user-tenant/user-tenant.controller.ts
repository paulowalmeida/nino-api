import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { Role } from '@shared/enums/role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantQueryDto } from './dtos/user-tenant-query.dto'
import { UserTenantPaginatedResponse } from './types/user-tenant-paginated-response.type'
import { UserTenantResponse } from './types/user-tenant.response.type'
import { UserTenantService } from './user-tenant.service'

@Controller('user-tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserTenantController {
  constructor(private readonly service: UserTenantService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPPORT)
  async create(@Body() body: CreateUserTenantDto): Promise<UserTenantResponse> {
    return this.service.create(body)
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  async getByUserId(
    @Param('userId') userId: string,
    @Query() query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    return this.service.getByUserId(userId, query)
  }

  @Get('tenant/:tenantId')
  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  async getByTenantId(
    @Param('tenantId') tenantId: string,
    @Query() query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    return this.service.getByTenantId(tenantId, query)
  }

  @Delete(':userId/:tenantId')
  @Roles(Role.ADMIN, Role.SUPPORT)
  async delete(
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
  ): Promise<{ message: string }> {
    return this.service.delete(userId, tenantId)
  }
}
