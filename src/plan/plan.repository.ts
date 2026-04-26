import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { Plan } from './types/plan.type'

@Injectable()
export class PlanRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async create(data: CreatePlanDto): Promise<Plan> {
    try {
      return (await this.prisma.plan.create({ data })) as unknown as Plan
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getAll(): Promise<Plan[]> {
    try {
      return (await this.prisma.plan.findMany()) as unknown as Plan[]
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: number): Promise<Plan> {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: { id },
      })

      if (!plan) throw new NotFoundException('Plan not found')

      return plan as unknown as Plan
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: number, data: UpdatePlanDto): Promise<void> {
    try {
      await this.prisma.plan.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.plan.delete({
        where: { id },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
