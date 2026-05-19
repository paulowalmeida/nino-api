import { CustomerPaymentMethod, PaymentMethod } from '@prisma/client'

export type CustomerPaymentMethodResponse = Omit<
  CustomerPaymentMethod,
  'methodId' | 'deletedAt'
> & {
  method: Pick<PaymentMethod, 'name' | 'description'>
}
