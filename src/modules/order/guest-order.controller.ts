import { Body, Controller, Post } from '@nestjs/common'

import { Public } from '@shared/decorators/public.decorator'

import { CreateGuestOrderDto } from './dtos/create-guest-order.dto'
import { OrderService } from './order.service'
import { OrderResponse } from './types/order-response.type'

@Controller('orders/guest')
@Public()
export class GuestOrderController {
  constructor(private readonly service: OrderService) {}

  @Post()
  async create(@Body() dto: CreateGuestOrderDto): Promise<OrderResponse> {
    return this.service.createGuest(dto)
  }
}
