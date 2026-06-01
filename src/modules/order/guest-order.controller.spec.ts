import { Test, TestingModule } from '@nestjs/testing'

import { Order } from '@prisma/client'

import { CreateGuestOrderDto } from './dtos/create-guest-order.dto'
import { GuestOrderController } from './guest-order.controller'
import { OrderService } from './order.service'
import { OrderResponse } from './types/order-response.type'

describe(GuestOrderController.name, () => {
  let controller: GuestOrderController

  const now = new Date()
  const price = 10 as unknown as Order['subtotal']

  const mockResponse: OrderResponse = {
    id: 'order-1',
    tenantId: 'tenant-1',
    customerId: null,
    courierId: null,
    deliveryAddressId: null,
    isDelivery: true,
    notes: null,
    subtotal: price,
    deliveryFee: price,
    totalAmount: price,
    guestName: 'João Silva',
    guestPhone: '91999990000',
    guestEmail: null,
    guestCpf: null,
    guestZipCode: '66000-000',
    guestStreet: 'Av. Nazaré',
    guestNumber: '100',
    guestComplement: null,
    guestNeighborhood: 'Nazaré',
    guestCity: 'Belém',
    guestState: 'PA',
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
    items: [],
    statusHistory: [],
  }

  const mockService: Pick<OrderService, 'createGuest'> = {
    createGuest: jest.fn().mockResolvedValue(mockResponse),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestOrderController],
      providers: [{ provide: OrderService, useValue: mockService }],
    }).compile()

    controller = module.get<GuestOrderController>(GuestOrderController)
  })

  it('create() should create a guest order without auth', async () => {
    const dto: CreateGuestOrderDto = {
      tenantId: 'tenant-1',
      isDelivery: true,
      deliveryFee: 5,
      guestName: 'João Silva',
      guestPhone: '91999990000',
      guestStreet: 'Av. Nazaré',
      guestNumber: '100',
      guestNeighborhood: 'Nazaré',
      guestCity: 'Belém',
      guestState: 'PA',
      items: [{ productId: 'product-1', quantity: 1, unitPrice: 10 }],
    }
    const result = await controller.create(dto)
    expect(mockService.createGuest).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockResponse)
  })
})
