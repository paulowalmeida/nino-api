import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common'

import { TenantSettings } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { UpsertTenantSettingsDto } from './dtos/upsert-tenant-settings.dto'
import { TenantSettingsService } from './tenant-settings.service'

@Controller('tenants/:tenantId/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantSettingsController {
  constructor(private readonly service: TenantSettingsService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getByTenantId(
    @Param('tenantId') tenantId: string,
  ): Promise<TenantSettings> {
    return this.service.getByTenantId(tenantId)
  }

  @Put()
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async upsert(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpsertTenantSettingsDto,
  ): Promise<TenantSettings> {
    return this.service.upsert(tenantId, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  async delete(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
