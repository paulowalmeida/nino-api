import { Injectable } from '@nestjs/common'

import { Plan, PlanType, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanResponse } from './types/plan.response.type'

@Injectable()
export class PlanRepository extends BaseRepository<Prisma.PlanDelegate> {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.plan, 'Plan')
  }

  private toResponse(plan: Plan & { type: PlanType }): PlanResponse {
    const { typeId: _, deletedAt: __, type, ...rest } = plan
    return { ...rest, type: { name: type.name } }
  }

  async getAll(): Promise<PlanResponse[]> {
    const plans = await this.findAll<Plan & { type: PlanType }>({
      orderBy: { name: 'asc' },
      include: { type: true },
    })
    return plans.map((p) => this.toResponse(p))
  }

  async getById(id: string): Promise<PlanResponse> {
    const plan = await this.findItem<Plan & { type: PlanType }>({
      where: { id },
      include: { type: true },
    })
    return this.toResponse(plan)
  }

  async create(data: CreatePlanDto): Promise<PlanResponse> {
    const saved = await this.insert<CreatePlanDto, Plan & { type: PlanType }>({
      data,
      include: { type: true },
    })
    return this.toResponse(saved)
  }

  async update(id: string, data: UpdatePlanDto): Promise<void> {
    await this.updateItem<UpdatePlanDto, Plan>({ where: { id }, data })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
