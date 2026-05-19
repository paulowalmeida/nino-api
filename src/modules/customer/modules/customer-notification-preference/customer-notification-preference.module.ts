import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'

import { CustomerOwnerGuard } from '../../guards/customer-owner.guard'
import { CustomerNotificationPreferenceController } from './customer-notification-preference.controller'
import { CustomerNotificationPreferenceRepository } from './customer-notification-preference.repository'
import { CustomerNotificationPreferenceService } from './customer-notification-preference.service'

@Module({
  controllers: [CustomerNotificationPreferenceController],
  providers: [
    CustomerNotificationPreferenceService,
    CustomerNotificationPreferenceRepository,
    CustomerOwnerGuard,
    ErrorService,
  ],
  exports: [CustomerNotificationPreferenceService],
})
export class CustomerNotificationPreferenceModule {}
