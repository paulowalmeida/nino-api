import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { OpeningHoursModule } from './modules/opening-hours/opening-hours.module'
import { TenantPaymentMethodModule } from './modules/tenant-payment-method/tenant-payment-method.module'
import { TenantPhoneModule } from './modules/tenant-phone/tenant-phone.module'
import { TenantSettingsModule } from './modules/tenant-settings/tenant-settings.module'
import { TenantStatusModule } from './modules/tenant-status/tenant-status.module'
import { TenantTypeModule } from './modules/tenant-type/tenant-type.module'
import { TenantController } from './tenant.controller'
import { TenantRepository } from './tenant.repository'
import { TenantService } from './tenant.service'

@Module({
  imports: [
    OpeningHoursModule,
    TenantPaymentMethodModule,
    TenantPhoneModule,
    TenantSettingsModule,
    TenantStatusModule,
    TenantTypeModule,
  ],
  controllers: [TenantController],
  providers: [TenantService, TenantRepository, ErrorService, PaginationService],
  exports: [TenantService, TenantRepository],
})
export class TenantModule {}
