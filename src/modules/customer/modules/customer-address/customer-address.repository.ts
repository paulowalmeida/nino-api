import { Injectable } from '@nestjs/common'

import { CustomerAddress, Prisma } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CreateCustomerAddressDto } from './dtos/create-customer-address.dto'
import { UpdateCustomerAddressDto } from './dtos/update-customer-address.dto'

@Injectable()
export class CustomerAddressRepository
  extends BaseRepository<Prisma.CustomerAddressDelegate>
  implements IBaseLookupRepository<
    CustomerAddress,
    CreateCustomerAddressDto,
    UpdateCustomerAddressDto,
    string
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.customerAddress, 'Customer Address')
  }

  private normalizePrimary(
    value: boolean | undefined,
  ): true | null | undefined {
    if (value === undefined) return undefined
    return value === true ? true : null
  }

  async getAll(customerId?: string): Promise<CustomerAddress[]> {
    return this.findAll<CustomerAddress>({ where: { customerId } })
  }

  async getById(id: string): Promise<CustomerAddress> {
    return this.findItem<CustomerAddress>({ where: { id } })
  }

  async create(
    data: CreateCustomerAddressDto,
  ): Promise<CustomerAddress> {
    return this.insert<
      Omit<CreateCustomerAddressDto, 'isPrimary'> & { isPrimary: true | null },
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
    return this.updateItem<
      Omit<UpdateCustomerAddressDto, 'isPrimary'> & {
        isPrimary?: true | null
      },
      CustomerAddress
    >({
      where: { id },
      data: { ...data, isPrimary: this.normalizePrimary(data.isPrimary) },
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
