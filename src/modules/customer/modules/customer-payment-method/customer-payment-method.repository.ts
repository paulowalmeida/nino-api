import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CreateCustomerPaymentMethodDto } from './dtos/create-customer-payment-method.dto'
import { UpdateCustomerPaymentMethodDto } from './dtos/update-customer-payment-method.dto'
import { CustomerPaymentMethodFull } from './types/customer-payment-method-full.type'
import { CustomerPaymentMethodResponse } from './types/customer-payment-method-response.type'

@Injectable()
export class CustomerPaymentMethodRepository extends BaseRepository<Prisma.CustomerPaymentMethodDelegate> {
  private readonly INCLUDE = { method: true } as const

  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(
      errorService,
      prisma.customerPaymentMethod,
      'Customer Payment Method',
    )
  }

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
  ): Promise<CustomerPaymentMethodResponse[]> {
    const items = await this.findAll<CustomerPaymentMethodFull>({
      where: { customerId },
      include: this.INCLUDE,
    })
    return items.map((item) => this.toResponse(item))
  }

  async getById(id: string): Promise<CustomerPaymentMethodResponse> {
    const item = await this.findItem<CustomerPaymentMethodFull>({
      where: { id },
      include: this.INCLUDE,
    })
    return this.toResponse(item)
  }

  async create(
    customerId: string,
    data: CreateCustomerPaymentMethodDto,
  ): Promise<CustomerPaymentMethodResponse> {
    const item = await this.insert<
      CreateCustomerPaymentMethodDto & { customerId: string },
      CustomerPaymentMethodFull
    >({ data: { ...data, customerId }, include: this.INCLUDE })
    return this.toResponse(item)
  }

  async update(
    id: string,
    data: UpdateCustomerPaymentMethodDto,
  ): Promise<CustomerPaymentMethodResponse> {
    const item = await this.updateItem<
      UpdateCustomerPaymentMethodDto,
      CustomerPaymentMethodFull
    >({ where: { id }, data, include: this.INCLUDE })
    return this.toResponse(item)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
