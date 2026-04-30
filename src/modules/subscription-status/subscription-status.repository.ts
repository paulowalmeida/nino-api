import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { SubscriptionStatus } from '@subscription-status/entities/subscription-status.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CreateSubscriptionStatusDto } from './dtos/create-subscription-status.dto'
import { UpdateSubscriptionStatusDto } from './dtos/update-subscription-status.dto'

@Injectable()
export class SubscriptionStatusRepository {
  constructor(
    @InjectRepository(SubscriptionStatus)
    private readonly repository: Repository<SubscriptionStatus>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<SubscriptionStatus[]> {
    try {
      return await this.repository.find({ order: { name: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<SubscriptionStatus> {
    try {
      const found = await this.repository.findOneBy({ id })
      if (!found) throw new NotFoundException('Subscription Status not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateSubscriptionStatusDto): Promise<SubscriptionStatus> {
    try {
      const exists = await this.repository.findOneBy({ name: data.name })
      if (exists) throw new ConflictException('Name already exists')

      const subscriptionStatus = this.repository.create(data)
      return await this.repository.save(subscriptionStatus)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateSubscriptionStatusDto): Promise<SubscriptionStatus> {
    try {
      const subscriptionStatus = await this.getById(id)

      if (data.name && data.name !== subscriptionStatus.name) {
        const exists = await this.repository.findOneBy({ name: data.name })
        if (exists) throw new ConflictException('Name already exists')
      }

      Object.assign(subscriptionStatus, data)
      return await this.repository.save(subscriptionStatus)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.softDelete(id)
      return { message: 'Subscription Status deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
