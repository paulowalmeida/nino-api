import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CustomerRepository } from './customer.repository'
import { CreateCustomerDto } from './dtos/create-customer.dto'
import { UpdateCustomerDto } from './dtos/update-customer.dto'
import { CustomerFull } from './types/customer-full.type'
import { CustomerPaginatedResponse } from './types/customer-paginated-response.type'
import { CustomerResponse } from './types/customer-response.type'

@Injectable()
export class CustomerService {
  private readonly include = { user: true } as const

  constructor(private readonly repo: CustomerRepository) {}

  private toResponse(customer: CustomerFull): CustomerResponse {
    const { deletedAt: _, userId: __, user, ...rest } = customer
    return { ...rest, user: { name: user.name, phone: user.phone } }
  }

  async getAll(query: PaginatedQueryDto): Promise<CustomerPaginatedResponse> {
    const result = await this.repo.findAllPaginated<CustomerFull>({
      page: query.page,
      size: query.size,
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      include: this.include,
    })
    return { ...result, data: result.data.map((c) => this.toResponse(c)) }
  }

  async getById(id: string): Promise<CustomerResponse> {
    const customer = await this.repo.findItem<CustomerFull>({
      where: { id },
      include: this.include,
    })
    return this.toResponse(customer)
  }

  async create(data: CreateCustomerDto): Promise<CustomerResponse> {
    const customer = await this.repo.insert<CreateCustomerDto, CustomerFull>({
      data,
      include: this.include,
    })
    return this.toResponse(customer)
  }

  async update(id: string, data: UpdateCustomerDto): Promise<CustomerResponse> {
    const customer = await this.repo.updateItem<
      UpdateCustomerDto,
      CustomerFull
    >({
      where: { id },
      data,
      include: this.include,
    })
    return this.toResponse(customer)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
