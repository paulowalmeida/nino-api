import { Injectable } from '@nestjs/common'

import { CustomerNotificationPreference, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { UpsertCustomerNotificationPreferenceDto } from './dtos/upsert-customer-notification-preference.dto'

@Injectable()
export class CustomerNotificationPreferenceRepository
  extends BaseRepository<Prisma.CustomerNotificationPreferenceDelegate> {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(
      errorService,
      prisma.customerNotificationPreference,
      'Customer Notification Preference',
    )
  }

  async getAll(
    customerId: string,
  ): Promise<CustomerNotificationPreference[]> {
    return this.findAll<CustomerNotificationPreference>({
      where: { customerId },
    })
  }

  async upsert(
    customerId: string,
    notificationTypeId: string,
    data: UpsertCustomerNotificationPreferenceDto,
  ): Promise<CustomerNotificationPreference> {
    const existing = await this.findItem<CustomerNotificationPreference>({
      where: { customerId_notificationTypeId: { customerId, notificationTypeId } },
    }).catch(() => null)

    if (existing) {
      return this.updateItem<
        UpsertCustomerNotificationPreferenceDto,
        CustomerNotificationPreference
      >({
        where: { customerId_notificationTypeId: { customerId, notificationTypeId } },
        data,
      })
    }

    return this.insert<
      UpsertCustomerNotificationPreferenceDto & {
        customerId: string
        notificationTypeId: string
      },
      CustomerNotificationPreference
    >({ data: { ...data, customerId, notificationTypeId } })
  }

  async delete(
    customerId: string,
    notificationTypeId: string,
  ): Promise<{ message: string }> {
    return this.updateItem<{ deletedAt: Date }, { message: string }>({
      where: { customerId_notificationTypeId: { customerId, notificationTypeId } },
      data: { deletedAt: new Date() },
    }).then(() => ({ message: 'Deleted successfully' }))
  }
}
