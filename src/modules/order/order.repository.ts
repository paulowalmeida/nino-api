import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { OrderFull } from './types/order-full.type'
import { OrderWithItemsData } from './types/order-with-items-data.type'

export const ORDER_INCLUDE = {
  status: true,
  items: { include: { product: true } },
  statusHistory: { include: { status: true } },
} as const

@Injectable()
export class OrderRepository extends BaseRepository<Prisma.OrderDelegate> {

  constructor(
    private readonly prisma: PrismaService,
    errorService: ErrorService,
    paginationService: PaginationService,
  ) {
    super(errorService, prisma.order, 'Order', paginationService)
  }

  async createWithItems(data: OrderWithItemsData): Promise<OrderFull> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({ data: data.order })
        await tx.orderItem.createMany({
          data: data.items.map((i) => ({ ...i, orderId: order.id })),
        })
        return tx.order.findFirstOrThrow({
          where: { id: order.id },
          include: ORDER_INCLUDE,
        })
      })
    } catch (error) {
      return this.errorService.handle(error)
    }
  }

  async updateStatus(id: string, statusId: string): Promise<OrderFull> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.orderStatusHistory.create({ data: { orderId: id, statusId } })
        return tx.order.update({
          where: { id },
          data: { statusId },
          include: ORDER_INCLUDE,
        })
      })
    } catch (error) {
      return this.errorService.handle(error)
    }
  }
}
