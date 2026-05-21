import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerPaymentMethodController } from './customer-payment-method.controller'
import { CustomerPaymentMethodRepository } from './customer-payment-method.repository'
import { CustomerPaymentMethodService } from './customer-payment-method.service'

@Module({
  controllers: [CustomerPaymentMethodController],
  providers: [
    CustomerPaymentMethodService,
    CustomerPaymentMethodRepository,
    CustomerOwnerGuard,
    ErrorService,
  ],
  exports: [CustomerPaymentMethodService],
})
export class CustomerPaymentMethodModule {}
