import { Injectable } from '@nestjs/common'

import { OrderStatus } from '@shared/enums/order-status.enum'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { OrderRepository } from './order.repository'
import { CreateGuestOrderDto } from './dtos/create-guest-order.dto'
import { CreateOrderDto } from './dtos/create-order.dto'
import { QueryOrderDto } from './dtos/query-order.dto'
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto'
import { OrderFull } from './types/order-full.type'
import { OrderPaginatedResponse } from './types/order-paginated-response.type'
import { OrderResponse } from './types/order-response.type'

@Injectable()
export class OrderService {
  private readonly include = {
    status: true,
    items: { include: { product: true } },
    statusHistory: { include: { status: true } },
  } as const

  constructor(
    private readonly repo: OrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  private toResponse(item: OrderFull): OrderResponse {
    const { statusId: _, ...rest } = item
    return rest
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
      include: this.include,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((o) => this.toResponse(o)) }
  }

  async getById(id: string): Promise<OrderResponse> {
    const item = await this.repo.findItem<OrderFull>({
      where: { id },
      include: this.include,
      ignoreDeleted: true,
    })
    return this.toResponse(item)
  }

  async create(dto: CreateOrderDto): Promise<OrderResponse> {
    const subtotal = dto.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    )
    const totalAmount = subtotal + dto.deliveryFee - (dto.loyaltyDiscount ?? 0)
    const order = await this.repo.createWithItems({
      order: {
        tenantId: dto.tenantId,
        statusId: dto.statusId,
        customerId: dto.customerId,
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
      },
      items: dto.items,
    })
    return this.toResponse(order)
  }

  async createGuest(dto: CreateGuestOrderDto): Promise<OrderResponse> {
    const status = await this.prisma.orderStatus.findFirstOrThrow({
      where: { name: OrderStatus.PENDING },
    })
    const subtotal = dto.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    )
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
      },
      items: dto.items,
    })
    return this.toResponse(order)
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    const order = await this.repo.updateStatus(id, dto.statusId)
    return this.toResponse(order)
  }
}
