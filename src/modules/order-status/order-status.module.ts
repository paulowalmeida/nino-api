import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { OrderStatusController } from './order-status.controller'

@Module({
  imports: [CommonModule.forFeature('orderStatus', 'Order Status')],
  controllers: [OrderStatusController],
})
export class OrderStatusModule {}
