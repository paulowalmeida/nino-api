import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { PaymentMethodController } from './payment-method.controller'

@Module({
  imports: [CommonModule.forFeature('paymentMethod', 'Payment Method')],
  controllers: [PaymentMethodController],
})
export class PaymentMethodModule {}
