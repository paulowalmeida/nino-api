import { Injectable } from '@nestjs/common'

import { CustomerNotificationPreference } from '@prisma/client'

import { UpsertCustomerNotificationPreferenceDto } from './dtos/upsert-customer-notification-preference.dto'
import { CustomerNotificationPreferenceRepository } from './customer-notification-preference.repository'

@Injectable()
export class CustomerNotificationPreferenceService {
  constructor(
    private readonly repo: CustomerNotificationPreferenceRepository,
  ) {}

  async getAll(
    customerId: string,
  ): Promise<CustomerNotificationPreference[]> {
    return this.repo.getAll(customerId)
  }

  async upsert(
    customerId: string,
    notificationTypeId: string,
    data: UpsertCustomerNotificationPreferenceDto,
  ): Promise<CustomerNotificationPreference> {
    return this.repo.upsert(customerId, notificationTypeId, data)
  }

  async delete(
    customerId: string,
    notificationTypeId: string,
  ): Promise<{ message: string }> {
    return this.repo.delete(customerId, notificationTypeId)
  }
}
