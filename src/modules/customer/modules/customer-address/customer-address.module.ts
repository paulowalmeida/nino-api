import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'

import { CustomerOwnerGuard } from '../../guards/customer-owner.guard'
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
  ],
  exports: [CustomerAddressService],
})
export class CustomerAddressModule {}
