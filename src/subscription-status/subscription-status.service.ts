import { Injectable } from '@nestjs/common'

import { SubscriptionStatusRepository } from './subscription-status.repository'

@Injectable()
export class SubscriptionStatusService {
  constructor(
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
  ) {}

  async getAll() {
    return await this.subscriptionStatusRepository.findAll()
  }

  async getById(id: string) {
    return await this.subscriptionStatusRepository.findById(id)
  }

  async getByCode(code: number) {
    return await this.subscriptionStatusRepository.findByCode(code)
  }
}
