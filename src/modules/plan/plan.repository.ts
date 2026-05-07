import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { Plan, PlanType } from '@prisma/client'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { ErrorService } from '@shared/services/error/error.service'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanResponse } from './types/plan.response.type'

@Injectable()
export class PlanRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  private toResponse(plan: Plan & { type: PlanType }): PlanResponse {
    const { typeId: _, deletedAt: __, type, ...rest } = plan
    return { ...rest, type: { name: type.name } }
  }

  async getAll(): Promise<PlanResponse[]> {
    try {
      const plans = await this.prisma.plan.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        include: { type: true },
      })
      return plans.map((p) => this.toResponse(p))
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<PlanResponse> {
    try {
      const found = await this.prisma.plan.findFirst({
        where: { id, deletedAt: null },
        include: { type: true },
      })
      if (!found) throw new NotFoundException('Plan not found')
      return this.toResponse(found)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreatePlanDto): Promise<PlanResponse> {
    try {
      const exists = await this.prisma.plan.findFirst({
        where: { slug: data.slug, deletedAt: null },
      })
      if (exists) throw new ConflictException('Slug already exists')
      const saved = await this.prisma.plan.create({
        data,
        include: { type: true },
      })
      return this.toResponse(saved)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdatePlanDto): Promise<void> {
    try {
      const plan = await this.getById(id)
      if (data.slug && data.slug !== plan.slug) {
        const exists = await this.prisma.plan.findFirst({
          where: { slug: data.slug, deletedAt: null },
        })
        if (exists) throw new ConflictException('Slug already exists')
      }
      await this.prisma.plan.update({ where: { id }, data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.getById(id)
      await this.prisma.plan.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
