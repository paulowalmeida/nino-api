import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CreateCustomerDto } from './dtos/create-customer.dto'
import { CustomerQueryDto } from './dtos/customer-query.dto'
import { UpdateCustomerDto } from './dtos/update-customer.dto'
import { CustomerFull } from './types/customer-full.type'
import { CustomerOrderBy } from './types/customer-order-by.type'
import { CustomerPaginatedResponse } from './types/customer-paginated-response.type'
import { CustomerResponse } from './types/customer-response.type'

@Injectable()
export class CustomerRepository
  extends BaseRepository<Prisma.CustomerDelegate>
  implements IBaseLookupRepository<
    CustomerResponse,
    CreateCustomerDto,
    UpdateCustomerDto,
    CustomerQueryDto,
    CustomerPaginatedResponse
  > {
  private readonly CUSTOMER_INCLUDE = { user: true } as const

  constructor(
    prisma: PrismaService,
    paginationService: PaginationService,
    errorService: ErrorService,
  ) {
    super(errorService, prisma.customer, 'Customer', paginationService)
  }

  private toResponse(customer: CustomerFull): CustomerResponse {
    const { deletedAt: _, userId: __, user, ...rest } = customer
    return { ...rest, user: { name: user.name, phone: user.phone } }
  }

  async getAll(query: CustomerQueryDto): Promise<CustomerPaginatedResponse> {
    const orderBy = query.orderBy ?? CustomerOrderBy.CREATED_AT
    const result = await this.findAllPaginated<CustomerFull>({
      page: query.page ?? 1,
      size: query.size ?? 10,
      orderBy: { [orderBy]: query.orderDir?.toLowerCase() ?? 'asc' },
      include: this.CUSTOMER_INCLUDE,
    })
    return { ...result, data: result.data.map((c) => this.toResponse(c)) }
  }

  async getById(id: string): Promise<CustomerResponse> {
    const customer = await this.findItem<CustomerFull>({
      where: { id },
      include: this.CUSTOMER_INCLUDE,
    })
    return this.toResponse(customer)
  }

  async create(data: CreateCustomerDto): Promise<CustomerResponse> {
    const customer = await this.insert<CreateCustomerDto, CustomerFull>({
      data,
      include: this.CUSTOMER_INCLUDE,
    })
    return this.toResponse(customer)
  }

  async update(
    id: string,
    data: UpdateCustomerDto,
  ): Promise<CustomerResponse> {
    const customer = await this.updateItem<UpdateCustomerDto, CustomerFull>({
      where: { id },
      data,
      include: this.CUSTOMER_INCLUDE,
    })
    return this.toResponse(customer)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
