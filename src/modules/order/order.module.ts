import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { OrderController } from './order.controller'
import { OrderRepository } from './order.repository'
import { OrderService } from './order.service'

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, ErrorService, PaginationService],
  exports: [OrderService],
})
export class OrderModule {}
