import { Injectable } from '@nestjs/common'

import { CustomerNotificationPreference } from '@prisma/client'

import { CustomerNotificationPreferenceRepository } from './customer-notification-preference.repository'
import { UpsertCustomerNotificationPreferenceDto } from './dtos/upsert-customer-notification-preference.dto'

@Injectable()
export class CustomerNotificationPreferenceService {
  constructor(
    private readonly repo: CustomerNotificationPreferenceRepository,
  ) {}

  async getAll(customerId: string): Promise<CustomerNotificationPreference[]> {
    return this.repo.findAll<CustomerNotificationPreference>({
      where: { customerId },
    })
  }

  async upsert(
    customerId: string,
    notificationTypeId: string,
    data: UpsertCustomerNotificationPreferenceDto,
  ): Promise<CustomerNotificationPreference> {
    const existing = await this.repo
      .findItem<CustomerNotificationPreference>({
        where: { customerId, notificationTypeId },
      })
      .catch(() => null)

    if (existing) {
      return this.repo.updateItem<
        UpsertCustomerNotificationPreferenceDto,
        CustomerNotificationPreference
      >({
        where: {
          customerId_notificationTypeId: { customerId, notificationTypeId },
        },
        data,
      })
    }

    return this.repo.insert<
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
    return this.repo.softDelete({
      customerId_notificationTypeId: { customerId, notificationTypeId },
    })
  }
}
