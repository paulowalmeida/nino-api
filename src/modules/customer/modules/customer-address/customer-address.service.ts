import { Injectable } from '@nestjs/common'

import { CustomerAddress } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CustomerAddressRepository } from './customer-address.repository'
import { CreateCustomerAddressDto } from './dtos/create-customer-address.dto'
import { UpdateCustomerAddressDto } from './dtos/update-customer-address.dto'

type NormalizedPrimary = true | null

@Injectable()
export class CustomerAddressService {
  constructor(private readonly repo: CustomerAddressRepository) {}

  private normalizePrimary(
    value: boolean | undefined,
  ): NormalizedPrimary | undefined {
    if (value === undefined) return undefined
    return value === true ? true : null
  }

  async getAll(
    customerId: string,
    query: PaginatedQueryDto,
  ): Promise<PaginatedResponse<CustomerAddress>> {
    return this.repo.findAllPaginated<CustomerAddress>({
      page: query.page,
      size: query.size,
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      where: { customerId },
    })
  }

  async getById(id: string): Promise<CustomerAddress> {
    return this.repo.findItem<CustomerAddress>({ where: { id } })
  }

  async create(data: CreateCustomerAddressDto): Promise<CustomerAddress> {
    return this.repo.insert<
      Omit<CreateCustomerAddressDto, 'isPrimary'> & {
        isPrimary: NormalizedPrimary
      },
      CustomerAddress
    >({
      data: {
        ...data,
        isPrimary: this.normalizePrimary(data.isPrimary) ?? null,
      },
    })
  }

  async update(
    id: string,
    data: UpdateCustomerAddressDto,
  ): Promise<CustomerAddress> {
    return this.repo.updateItem<
      Omit<UpdateCustomerAddressDto, 'isPrimary'> & {
        isPrimary?: NormalizedPrimary
      },
      CustomerAddress
    >({
      where: { id },
      data: { ...data, isPrimary: this.normalizePrimary(data.isPrimary) },
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
