import { Test, TestingModule } from '@nestjs/testing'

import { Order } from '@prisma/client'

import { OrderRepository } from './order.repository'
import { OrderService } from './order.service'
import { CreateOrderDto } from './dtos/create-order.dto'
import { QueryOrderDto } from './dtos/query-order.dto'
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto'
import { OrderFull } from './types/order-full.type'
import { OrderResponse } from './types/order-response.type'

describe(OrderService.name, () => {
  let service: OrderService

  const now = new Date()
  const price = 10 as unknown as Order['subtotal']

  const mockFull: OrderFull = {
    id: 'order-1',
    tenantId: 'tenant-1',
    customerId: 'customer-1',
    statusId: 'status-1',
    courierId: null,
    deliveryAddressId: null,
    isDelivery: true,
    notes: null,
    subtotal: price,
    deliveryFee: price,
    totalAmount: price,
    guestName: null,
    guestPhone: null,
    guestEmail: null,
    guestCpf: null,
    guestZipCode: null,
    guestStreet: null,
    guestNumber: null,
    guestComplement: null,
    guestNeighborhood: null,
    guestCity: null,
    guestState: null,
    loyaltyPointsUsed: 0,
    loyaltyDiscount: price,
    estimatedDeliveryAt: null,
    createdAt: now,
    updatedAt: now,
    status: {
      id: 'status-1',
      name: 'PENDING',
      description: null,
      createdAt: now,
      updatedAt: now,
    },
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'product-1',
        quantity: 1,
        unitPrice: price,
        createdAt: now,
        updatedAt: now,
        product: {
          id: 'product-1',
          tenantId: 'tenant-1',
          categoryId: 'cat-1',
          name: 'Burger',
          description: null,
          price,
          position: 0,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      },
    ],
    statusHistory: [
      {
        id: 'history-1',
        orderId: 'order-1',
        statusId: 'status-1',
        createdAt: now,
        status: {
          id: 'status-1',
          name: 'PENDING',
          description: null,
          createdAt: now,
          updatedAt: now,
        },
      },
    ],
  }

  const mockResponse: OrderResponse = (() => {
    const { statusId: _, ...rest } = mockFull
    return rest
  })()

  const mockPaginated = {
    data: [mockFull],
    pagination: {
      page: 1,
      size: 10,
      total: 1,
      totalPages: 1,
      previousPage: null,
      nextPage: null,
    },
  }

  const mockRepo: Pick<
    OrderRepository,
    'findAllPaginated' | 'findItem' | 'createWithItems' | 'updateStatus'
  > = {
    findAllPaginated: jest.fn().mockResolvedValue(mockPaginated),
    findItem: jest.fn().mockResolvedValue(mockFull),
    createWithItems: jest.fn().mockResolvedValue(mockFull),
    updateStatus: jest.fn().mockResolvedValue(mockFull),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<OrderService>(OrderService)
  })

  it('getAll() should return paginated OrderResponse', async () => {
    const query: QueryOrderDto = { page: 1, size: 10, tenantId: 'tenant-1' }
    const result = await service.getAll(query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        size: 10,
        where: { tenantId: 'tenant-1' },
        ignoreDeleted: true,
      }),
    )
    expect(result.data).toEqual([mockResponse])
    expect((result.data[0] as Record<string, unknown>).statusId).toBeUndefined()
  })

  it('getById() should return mapped OrderResponse', async () => {
    const result = await service.getById('order-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      include: expect.any(Object),
      ignoreDeleted: true,
    })
    expect(result).toEqual(mockResponse)
  })

  it('create() should calculate subtotal/total and call createWithItems', async () => {
    const dto: CreateOrderDto = {
      tenantId: 'tenant-1',
      statusId: 'status-1',
      customerId: 'customer-1',
      isDelivery: true,
      deliveryFee: 5,
      items: [{ productId: 'product-1', quantity: 1, unitPrice: 10 }],
    }
    const result = await service.create(dto)
    expect(mockRepo.createWithItems).toHaveBeenCalledWith({
      order: expect.objectContaining({
        tenantId: 'tenant-1',
        subtotal: 10,
        totalAmount: 15,
      }),
      items: [{ productId: 'product-1', quantity: 1, unitPrice: 10 }],
    })
    expect(result).toEqual(mockResponse)
  })

  it('getAll() should build empty where when no filters', async () => {
    await service.getAll({})
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    )
  })

  it('getAll() should add customerId to where when provided', async () => {
    await service.getAll({ customerId: 'customer-1' })
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ where: { customerId: 'customer-1' } }),
    )
  })

  it('getAll() should use provided target and direction', async () => {
    await service.getAll({ target: 'updatedAt', direction: 'asc' })
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { target: 'updatedAt', direction: 'asc' },
      }),
    )
  })

  it('create() should apply loyaltyDiscount when provided', async () => {
    const dto: CreateOrderDto = {
      tenantId: 'tenant-1',
      statusId: 'status-1',
      customerId: 'customer-1',
      isDelivery: false,
      deliveryFee: 0,
      loyaltyDiscount: 5,
      items: [{ productId: 'product-1', quantity: 2, unitPrice: 10 }],
    }
    await service.create(dto)
    expect(mockRepo.createWithItems).toHaveBeenCalledWith(
      expect.objectContaining({
        order: expect.objectContaining({ totalAmount: 15, loyaltyDiscount: 5 }),
      }),
    )
  })

  it('create() should parse estimatedDeliveryAt when provided', async () => {
    const date = '2026-01-01T12:00:00.000Z'
    const dto: CreateOrderDto = {
      tenantId: 'tenant-1',
      statusId: 'status-1',
      customerId: 'customer-1',
      isDelivery: false,
      deliveryFee: 0,
      estimatedDeliveryAt: date,
      items: [{ productId: 'product-1', quantity: 1, unitPrice: 10 }],
    }
    await service.create(dto)
    expect(mockRepo.createWithItems).toHaveBeenCalledWith(
      expect.objectContaining({
        order: expect.objectContaining({
          estimatedDeliveryAt: new Date(date),
        }),
      }),
    )
  })

  it('updateStatus() should delegate to repo.updateStatus', async () => {
    const dto: UpdateOrderStatusDto = { statusId: 'status-2' }
    const result = await service.updateStatus('order-1', dto)
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('order-1', 'status-2')
    expect(result).toEqual(mockResponse)
  })
})
