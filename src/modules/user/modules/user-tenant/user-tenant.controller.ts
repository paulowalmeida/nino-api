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
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantQueryDto } from './dtos/user-tenant-query.dto'
import {
  UserTenantPaginatedResponse,
} from './types/user-tenant-paginated-response.type'
import { UserTenantResponse } from './types/user-tenant.response.type'
import { UserTenantService } from './user-tenant.service'

@Controller('user-tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserTenantController {
  constructor(private readonly service: UserTenantService) {}

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async create(@Body() body: CreateUserTenantDto): Promise<UserTenantResponse> {
    return this.service.create(body)
  }

  @Get('user/:userId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getByUserId(
    @Param('userId') userId: string,
    @Query() query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    return this.service.getByUserId(userId, query)
  }

  @Get('tenant/:tenantId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getByTenantId(
    @Param('tenantId') tenantId: string,
    @Query() query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    return this.service.getByTenantId(tenantId, query)
  }

  @Delete(':userId/:tenantId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async delete(
    @Param('userId') userId: string,
    @Param('tenantId') tenantId: string,
  ): Promise<{ message: string }> {
    return this.service.delete(userId, tenantId)
  }
}
