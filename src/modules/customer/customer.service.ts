import { Injectable } from '@nestjs/common'

import { BaseService } from '@shared/services/base/base.service'

import { CreateCustomerDto } from './dtos/create-customer.dto'
import { CustomerQueryDto } from './dtos/customer-query.dto'
import { UpdateCustomerDto } from './dtos/update-customer.dto'
import { CustomerRepository } from './customer.repository'
import { CustomerPaginatedResponse } from './types/customer-paginated-response.type'
import { CustomerResponse } from './types/customer-response.type'

@Injectable()
export class CustomerService extends BaseService<
  CustomerResponse,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQueryDto,
  CustomerPaginatedResponse
> {
  constructor(private readonly repo: CustomerRepository) {
    super(repo)
  }
}
