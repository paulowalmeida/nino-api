import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { OrderStatus } from '@shared/enums/order-status.enum'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { ORDER_INCLUDE, OrderRepository } from './order.repository'
import { CreateGuestOrderDto } from './dtos/create-guest-order.dto'
import { CreateOrderDto } from './dtos/create-order.dto'
import { CreateOrderItemDto } from './dtos/create-order-item.dto'
import { QueryOrderDto } from './dtos/query-order.dto'
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto'
import { OrderFull } from './types/order-full.type'
import { OrderPaginatedResponse } from './types/order-paginated-response.type'
import { OrderResponse } from './types/order-response.type'

type GuestFields = {
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  guestCpf?: string
  guestZipCode?: string
  guestStreet?: string
  guestNumber?: string
  guestComplement?: string
  guestNeighborhood?: string
  guestCity?: string
  guestState?: string
}

@Injectable()
export class OrderService {
  constructor(
    private readonly repo: OrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  private toResponse(item: OrderFull): OrderResponse {
    const { statusId: _, ...rest } = item
    return rest
  }

  private calcSubtotal(items: CreateOrderItemDto[]): number {
    return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  }

  private pickGuestFields(dto: GuestFields) {
    return {
      guestName: dto.guestName,
      guestPhone: dto.guestPhone,
      guestEmail: dto.guestEmail,
      guestCpf: dto.guestCpf,
      guestZipCode: dto.guestZipCode,
      guestStreet: dto.guestStreet,
      guestNumber: dto.guestNumber,
      guestComplement: dto.guestComplement,
      guestNeighborhood: dto.guestNeighborhood,
      guestCity: dto.guestCity,
      guestState: dto.guestState,
    }
  }

  private async getPendingStatus() {
    try {
      return await this.prisma.orderStatus.findFirstOrThrow({
        where: { name: OrderStatus.PENDING },
      })
    } catch {
      throw new NotFoundException('Order status PENDING not configured')
    }
  }

  async getAll(params?: QueryOrderDto): Promise<OrderPaginatedResponse> {
    const where = {
      ...(params?.tenantId ? { tenantId: params.tenantId } : {}),
      ...(params?.customerId ? { customerId: params.customerId } : {}),
    }
    const result = await this.repo.findAllPaginated<OrderFull>({
      page: params?.page,
      size: params?.size,
      order: {
        target: params?.target ?? 'createdAt',
        direction: params?.direction ?? 'desc',
      },
      where,
      include: ORDER_INCLUDE,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((o) => this.toResponse(o)) }
  }

  async getById(id: string): Promise<OrderResponse> {
    const item = await this.repo.findItem<OrderFull>({
      where: { id },
      include: ORDER_INCLUDE,
      ignoreDeleted: true,
    })
    return this.toResponse(item)
  }

  async create(dto: CreateOrderDto, callerUserId?: string): Promise<OrderResponse> {
    const status = await this.getPendingStatus()
    let customerId = dto.customerId
    if (callerUserId) {
      const customer = await this.prisma.customer.findFirstOrThrow({
        where: { userId: callerUserId },
      })
      customerId = customer.id
    }
    const subtotal = this.calcSubtotal(dto.items)
    const totalAmount = subtotal + dto.deliveryFee - (dto.loyaltyDiscount ?? 0)
    if (totalAmount < 0) {
      throw new BadRequestException('loyaltyDiscount cannot exceed subtotal + deliveryFee')
    }
    const order = await this.repo.createWithItems({
      order: {
        tenantId: dto.tenantId,
        statusId: status.id,
        customerId,
        deliveryAddressId: dto.deliveryAddressId,
        isDelivery: dto.isDelivery,
        deliveryFee: dto.deliveryFee,
        subtotal,
        totalAmount,
        notes: dto.notes,
        estimatedDeliveryAt: dto.estimatedDeliveryAt
          ? new Date(dto.estimatedDeliveryAt)
          : undefined,
        loyaltyPointsUsed: dto.loyaltyPointsUsed,
        loyaltyDiscount: dto.loyaltyDiscount,
        ...this.pickGuestFields(dto),
      },
      items: dto.items,
    })
    return this.toResponse(order)
  }

  async createGuest(dto: CreateGuestOrderDto): Promise<OrderResponse> {
    const status = await this.getPendingStatus()
    const subtotal = this.calcSubtotal(dto.items)
    const deliveryFee = dto.deliveryFee ?? 0
    const order = await this.repo.createWithItems({
      order: {
        tenantId: dto.tenantId,
        statusId: status.id,
        isDelivery: dto.isDelivery,
        deliveryFee,
        subtotal,
        totalAmount: subtotal + deliveryFee,
        notes: dto.notes,
        ...this.pickGuestFields(dto),
      },
      items: dto.items,
    })
    return this.toResponse(order)
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    const order = await this.prisma.$transaction(async (tx) => {
      await tx.orderStatusHistory.create({ data: { orderId: id, statusId: dto.statusId } })
      return tx.order.update({
        where: { id },
        data: { statusId: dto.statusId },
        include: ORDER_INCLUDE,
      })
    })
    return this.toResponse(order as OrderFull)
  }
}
