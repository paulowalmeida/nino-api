import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { CustomerAddressModule } from './modules/customer-address/customer-address.module'
import { CustomerNotificationPreferenceModule } from './modules/customer-notification-preference/customer-notification-preference.module'
import { CustomerPaymentMethodModule } from './modules/customer-payment-method/customer-payment-method.module'
import { CustomerTenantModule } from './modules/customer-tenant/customer-tenant.module'
import { LoyaltyTransactionModule } from './modules/loyalty-transaction/loyalty-transaction.module'
import { CustomerController } from './customer.controller'
import { CustomerOwnerGuard } from './guards/customer-owner.guard'
import { CustomerRepository } from './customer.repository'
import { CustomerService } from './customer.service'

@Module({
  imports: [
    CustomerAddressModule,
    CustomerNotificationPreferenceModule,
    CustomerPaymentMethodModule,
    CustomerTenantModule,
    LoyaltyTransactionModule,
  ],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    CustomerRepository,
    CustomerOwnerGuard,
    ErrorService,
    PaginationService,
  ],
  exports: [CustomerService, CustomerRepository],
})
export class CustomerModule {}
