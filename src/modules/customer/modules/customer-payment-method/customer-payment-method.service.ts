import { Injectable } from '@nestjs/common'

import { CreateCustomerPaymentMethodDto } from './dtos/create-customer-payment-method.dto'
import { UpdateCustomerPaymentMethodDto } from './dtos/update-customer-payment-method.dto'
import { CustomerPaymentMethodRepository } from './customer-payment-method.repository'
import { CustomerPaymentMethodResponse } from './types/customer-payment-method-response.type'

@Injectable()
export class CustomerPaymentMethodService {
  constructor(
    private readonly repo: CustomerPaymentMethodRepository,
  ) {}

  async getAll(
    customerId: string,
  ): Promise<CustomerPaymentMethodResponse[]> {
    return this.repo.getAll(customerId)
  }

  async getById(id: string): Promise<CustomerPaymentMethodResponse> {
    return this.repo.getById(id)
  }

  async create(
    customerId: string,
    data: CreateCustomerPaymentMethodDto,
  ): Promise<CustomerPaymentMethodResponse> {
    return this.repo.create(customerId, data)
  }

  async update(
    id: string,
    data: UpdateCustomerPaymentMethodDto,
  ): Promise<CustomerPaymentMethodResponse> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
