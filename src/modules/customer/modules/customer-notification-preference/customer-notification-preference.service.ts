import { Injectable } from '@nestjs/common'

import { CustomerNotificationPreferenceRepository } from './customer-notification-preference.repository'
import { UpsertCustomerNotificationPreferenceDto } from './dtos/upsert-customer-notification-preference.dto'
import { CustomerNotificationPreferenceFull } from './types/customer-notification-preference-full.type'
import { CustomerNotificationPreferenceResponse } from './types/customer-notification-preference-response.type'

type CreateData = UpsertCustomerNotificationPreferenceDto & {
  customerId: string
  notificationTypeId: string
}

@Injectable()
export class CustomerNotificationPreferenceService {
  private readonly include = { notificationType: true } as const

  constructor(
    private readonly repo: CustomerNotificationPreferenceRepository,
  ) {}

  private toResponse(
    pref: CustomerNotificationPreferenceFull,
  ): CustomerNotificationPreferenceResponse {
    const { customerId: _, notificationTypeId: __, ...rest } = pref
    return rest
  }

  private async getById(
    id: string,
  ): Promise<CustomerNotificationPreferenceResponse> {
    const pref = await this.repo.findItem<CustomerNotificationPreferenceFull>({
      where: { id },
      include: this.include,
    })
    return this.toResponse(pref)
  }

  async getAll(
    customerId: string,
  ): Promise<CustomerNotificationPreferenceResponse[]> {
    const prefs = await this.repo.findAll<CustomerNotificationPreferenceFull>({
      where: { customerId },
      include: this.include,
    })
    return prefs.map((p) => this.toResponse(p))
  }

  async upsert(
    customerId: string,
    notificationTypeId: string,
    data: UpsertCustomerNotificationPreferenceDto,
  ): Promise<CustomerNotificationPreferenceResponse> {
    const existing = await this.repo
      .findItem<CustomerNotificationPreferenceFull>({
        where: { customerId, notificationTypeId },
        include: this.include,
      })
      .catch(() => null)

    if (existing) {
      await this.repo.updateItem<
        UpsertCustomerNotificationPreferenceDto,
        CustomerNotificationPreferenceFull
      >({
        where: {
          customerId_notificationTypeId: { customerId, notificationTypeId },
        },
        data,
      })
      return this.getById(existing.id)
    }

    const created = await this.repo.insert<
      CreateData,
      CustomerNotificationPreferenceFull
    >({
      data: { ...data, customerId, notificationTypeId },
      include: this.include,
    })
    return this.toResponse(created)
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
