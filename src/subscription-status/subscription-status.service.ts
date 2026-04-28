import { Injectable } from '@nestjs/common'

import { CreateSubscriptionStatusDto } from './dtos/create-subscription-status.dto'
import { UpdateSubscriptionStatusDto } from './dtos/update-subscription-status.dto'
import { SubscriptionStatusRepository } from './subscription-status.repository'
import { SubscriptionStatus } from '@subscription-status/entities/subscription-status.entity'

@Injectable()
export class SubscriptionStatusService {
  constructor(private repo: SubscriptionStatusRepository) {}

  async getAll(): Promise<SubscriptionStatus[]> {
    return await this.repo.getAll()
  }

  async getById(id: string): Promise<SubscriptionStatus> {
    return await this.repo.getById(id)
  }

  async create(data: CreateSubscriptionStatusDto): Promise<SubscriptionStatus> {
    return this.repo.create(data)
  }

  async update(
    id: string,
    data: UpdateSubscriptionStatusDto,
  ): Promise<SubscriptionStatus> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
