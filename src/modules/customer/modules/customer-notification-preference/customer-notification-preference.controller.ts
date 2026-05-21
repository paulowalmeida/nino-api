import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common'

import { CustomerNotificationPreferenceResponse } from './types/customer-notification-preference-response.type'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerNotificationPreferenceService } from './customer-notification-preference.service'
import { UpsertCustomerNotificationPreferenceDto } from './dtos/upsert-customer-notification-preference.dto'

@Controller('customers/:customerId/notification-preferences')
@UseGuards(JwtAuthGuard, RolesGuard, CustomerOwnerGuard)
export class CustomerNotificationPreferenceController {
  constructor(
    private readonly service: CustomerNotificationPreferenceService,
  ) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async getAll(
    @Param('customerId') customerId: string,
  ): Promise<CustomerNotificationPreferenceResponse[]> {
    return this.service.getAll(customerId)
  }

  @Put(':notificationTypeId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async upsert(
    @Param('customerId') customerId: string,
    @Param('notificationTypeId') notificationTypeId: string,
    @Body() dto: UpsertCustomerNotificationPreferenceDto,
  ): Promise<CustomerNotificationPreferenceResponse> {
    return this.service.upsert(customerId, notificationTypeId, dto)
  }

  @Delete(':notificationTypeId')
  @Roles(GlobalRole.ADMIN, GlobalRole.CUSTOMER)
  async delete(
    @Param('customerId') customerId: string,
    @Param('notificationTypeId') notificationTypeId: string,
  ): Promise<{ message: string }> {
    return this.service.delete(customerId, notificationTypeId)
  }
}
