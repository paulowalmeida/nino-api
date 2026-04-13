import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'

@Injectable()
export class SubscriptionStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async findAll() {
    try {
      return await this.prisma.subscriptionStatus.findMany()
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findById(id: string) {
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

  async findByCode(code: number) {
    try {
      const status = await this.prisma.subscriptionStatus.findUnique({
        where: { code },
      })

      if (!status) throw new NotFoundException('Subscription Status not found')

      return status
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
