import { Prisma } from '@prisma/client'

export type CustomerNotificationPreferenceFull =
  Prisma.CustomerNotificationPreferenceGetPayload<{
    include: { notificationType: true }
  }>
