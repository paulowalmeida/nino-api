import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CreateCustomerPaymentMethodDto } from './dtos/create-customer-payment-method.dto'
import { UpdateCustomerPaymentMethodDto } from './dtos/update-customer-payment-method.dto'
import { CustomerPaymentMethodRepository } from './customer-payment-method.repository'
import { CustomerPaymentMethodFull } from './types/customer-payment-method-full.type'
import { CustomerPaymentMethodPaginatedResponse } from './types/customer-payment-method-paginated-response.type'
import { CustomerPaymentMethodResponse } from './types/customer-payment-method-response.type'

type CreateData = CreateCustomerPaymentMethodDto & { customerId: string }

@Injectable()
export class CustomerPaymentMethodService {
  private readonly include = { method: true } as const

  constructor(private readonly repo: CustomerPaymentMethodRepository) {}

  private toResponse(
    item: CustomerPaymentMethodFull,
  ): CustomerPaymentMethodResponse {
    const { deletedAt: _, methodId: __, method, ...rest } = item
    return {
      ...rest,
      method: { name: method.name, description: method.description },
    }
  }

  async getAll(
    customerId: string,
    query: PaginatedQueryDto,
  ): Promise<CustomerPaymentMethodPaginatedResponse> {
    const result = await this.repo.findAllPaginated<CustomerPaymentMethodFull>({
      where: { customerId },
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      include: this.include,
      page: query.page,
      size: query.size,
    })
    return { ...result, data: result.data.map((item) => this.toResponse(item)) }
  }

  async getById(id: string): Promise<CustomerPaymentMethodResponse> {
    const item = await this.repo.findItem<CustomerPaymentMethodFull>({
      where: { id },
      include: this.include,
    })
    return this.toResponse(item)
  }

  async create(data: CreateData): Promise<CustomerPaymentMethodResponse> {
    const item = await this.repo.insert<CreateData, CustomerPaymentMethodFull>({
      data,
      include: this.include,
    })
    return this.toResponse(item)
  }

  async update(
    id: string,
    data: UpdateCustomerPaymentMethodDto,
  ): Promise<CustomerPaymentMethodResponse> {
    const item = await this.repo.updateItem<
      UpdateCustomerPaymentMethodDto,
      CustomerPaymentMethodFull
    >({ where: { id }, data, include: this.include })
    return this.toResponse(item)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
