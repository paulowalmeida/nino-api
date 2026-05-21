import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerAddressController } from './customer-address.controller'
import { CustomerAddressRepository } from './customer-address.repository'
import { CustomerAddressService } from './customer-address.service'

@Module({
  controllers: [CustomerAddressController],
  providers: [
    CustomerAddressService,
    CustomerAddressRepository,
    CustomerOwnerGuard,
    ErrorService,
    PaginationService,
  ],
  exports: [CustomerAddressService],
})
export class CustomerAddressModule {}
