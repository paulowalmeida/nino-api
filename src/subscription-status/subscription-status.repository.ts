import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { SubscriptionStatus } from '@subscription-status/types/subscription-status.type'

@Injectable()
export class SubscriptionStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async findAll(): Promise<SubscriptionStatus[]>  {
    try {
      return await this.prisma.subscriptionStatus.findMany()
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findById(id: number): Promise<SubscriptionStatus> {
    try {
      const status = await this.prisma.subscriptionStatus.findUnique({
        where: { id },
      })

      if (!status) throw new NotFoundException('Subscription Status not found')

      return status
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
