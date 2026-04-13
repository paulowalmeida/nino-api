import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { Plan } from './types/plan.type'

@Injectable()
export class PlanRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async findAll(): Promise<Plan[]> {
    try {
      return await this.prisma.plan.findMany({
        where: { isActive: true },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findAllIncludeInactive(): Promise<Plan[]> {
    try {
      return await this.prisma.plan.findMany()
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findById(id: string): Promise<Plan> {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { id },
      })

      if (!plan) throw new NotFoundException('Plan not found')

      return plan
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findByCode(code: number): Promise<Plan> {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { code },
      })

      if (!plan) throw new NotFoundException('Plan not found')

      return plan
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findBySlug(slug: string): Promise<Plan> {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { slug },
      })

      if (!plan) throw new NotFoundException('Plan not found')

      return plan
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
