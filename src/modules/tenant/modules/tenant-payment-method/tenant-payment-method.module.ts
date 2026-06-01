import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { TenantPaymentMethodController } from './tenant-payment-method.controller'
import { TenantPaymentMethodRepository } from './tenant-payment-method.repository'
import { TenantPaymentMethodService } from './tenant-payment-method.service'

@Module({
  controllers: [TenantPaymentMethodController],
  providers: [
    TenantPaymentMethodService,
    TenantPaymentMethodRepository,
    ErrorService,
    PaginationService,
  ],
  exports: [TenantPaymentMethodService],
})
export class TenantPaymentMethodModule {}
