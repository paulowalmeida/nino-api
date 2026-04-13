import { Injectable } from '@nestjs/common'

import { SubscriptionStatus } from '@subscription-status/types/subscription-status.type'
import { SubscriptionStatusRepository } from './subscription-status.repository'

@Injectable()
export class SubscriptionStatusService {
  constructor(
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
  ) {}

  async getAll(): Promise<SubscriptionStatus[]> {
    return await this.subscriptionStatusRepository.findAll()
  }

  async getById(id: number): Promise<SubscriptionStatus> {
    return await this.subscriptionStatusRepository.findById(id)
  }
}
