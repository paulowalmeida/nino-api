import { SubscriptionFull } from './subscription-full.type'

export type SubscriptionResponse = Omit<
  SubscriptionFull,
  'planId' | 'subscriptionStatusId' | 'deletedAt'
>
