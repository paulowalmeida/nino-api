import { Injectable } from '@nestjs/common'

import { CustomerAddress } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'

import { CreateCustomerAddressDto } from './dtos/create-customer-address.dto'
import { UpdateCustomerAddressDto } from './dtos/update-customer-address.dto'
import { CustomerAddressRepository } from './customer-address.repository'

@Injectable()
export class CustomerAddressService extends BaseService<
  CustomerAddress,
  CreateCustomerAddressDto,
  UpdateCustomerAddressDto,
  string
> {
  constructor(private readonly repo: CustomerAddressRepository) {
    super(repo)
  }
}
