import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { SubscriptionStatus } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import {
  CreateSubscriptionStatusDto,
} from './dtos/create-subscription-status.dto'
import {
  UpdateSubscriptionStatusDto,
} from './dtos/update-subscription-status.dto'

@Injectable()
export class SubscriptionStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<SubscriptionStatus[]> {
    try {
      return await this.prisma.subscriptionStatus.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<SubscriptionStatus> {
    try {
      const found = await this.prisma.subscriptionStatus.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found) throw new NotFoundException('Subscription Status not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateSubscriptionStatusDto): Promise<SubscriptionStatus> {
    try {
      const exists = await this.prisma.subscriptionStatus.findFirst({
        where: { name: data.name, deletedAt: null },
      })
      if (exists) throw new ConflictException('Name already exists')
      return await this.prisma.subscriptionStatus.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(
    id: string,
    data: UpdateSubscriptionStatusDto,
  ): Promise<SubscriptionStatus> {
    try {
      const item = await this.getById(id)
      if (data.name && data.name !== item.name) {
        const exists = await this.prisma.subscriptionStatus.findFirst({
          where: { name: data.name, deletedAt: null },
        })
        if (exists) throw new ConflictException('Name already exists')
      }
      return await this.prisma.subscriptionStatus.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.subscriptionStatus.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Subscription Status deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
