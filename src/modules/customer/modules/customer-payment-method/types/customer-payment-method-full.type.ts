import { Prisma } from '@prisma/client'

export type CustomerPaymentMethodFull =
  Prisma.CustomerPaymentMethodGetPayload<{
    include: { method: true }
  }>
