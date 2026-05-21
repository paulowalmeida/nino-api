import { LoyaltyTransactionFull } from './loyalty-transaction-full.type'

export type LoyaltyTransactionResponse = Omit<
  LoyaltyTransactionFull,
  'customerId' | 'tenantId'
>
