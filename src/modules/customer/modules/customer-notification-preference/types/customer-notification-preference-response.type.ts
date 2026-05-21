import { CustomerNotificationPreferenceFull } from './customer-notification-preference-full.type'

export type CustomerNotificationPreferenceResponse = Omit<
  CustomerNotificationPreferenceFull,
  'customerId' | 'notificationTypeId'
>
