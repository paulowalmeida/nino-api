import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { SubscriptionStatus } from './types/subscription-status.type'
import { CreateSubscriptionStatusDto } from './dtos/create-subscription-status.dto'
import { UpdateSubscriptionStatusDto } from './dtos/update-subscription-status.dto'

@Injectable()
export class SubscriptionStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async getAll(): Promise<SubscriptionStatus[]> {
    try {
      return await this.prisma.subscriptionStatus.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<SubscriptionStatus> {
    try {
      const found = await this.prisma.subscriptionStatus.findUnique({
        where: { id },
      })

      if (!found) throw new NotFoundException('Subscription Status not found')

      return found
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async create(data: CreateSubscriptionStatusDto): Promise<SubscriptionStatus> {
    try {
      const existsByName = await this.prisma.subscriptionStatus.findUnique({
        where: { name: data.name },
      })
      if (existsByName) throw new ConflictException('Name already exists')

      return await this.prisma.subscriptionStatus.create({ data })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, data: UpdateSubscriptionStatusDto): Promise<SubscriptionStatus> {
    try {
      if (data.name) {
        const found = await this.prisma.subscriptionStatus.findUnique({
          where: { name: data.name },
        })

        if (found && found.id !== id) {
          throw new ConflictException('Name already exists')
        }
      }

      return await this.prisma.subscriptionStatus.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.subscriptionStatus.delete({ where: { id } })
      return { message: 'Subscription Status deleted successfully' }
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
