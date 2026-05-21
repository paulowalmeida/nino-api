import { PaymentMethod, TenantPaymentMethod } from '@prisma/client'

export type TenantPaymentMethodResponse = Omit<
  TenantPaymentMethod,
  'methodId' | 'deletedAt'
> & {
  method: Pick<PaymentMethod, 'name' | 'description'>
}
