import { Injectable } from '@nestjs/common'

import { PlanRepository } from './plan.repository'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanResponse } from './types/plan.response.type'
import { PlanWithType } from './types/plan-with-type.type'

@Injectable()
export class PlanService {
  private readonly include = { type: true } as const

  constructor(private readonly repo: PlanRepository) {}

  private toResponse(plan: PlanWithType): PlanResponse {
    const { typeId: _, deletedAt: __, type, ...rest } = plan
    return { ...rest, type: { name: type.name } }
  }

  async getAll(): Promise<PlanResponse[]> {
    const plans = await this.repo.findAll<PlanWithType>({
      include: this.include,
    })
    return plans.map((p) => this.toResponse(p))
  }

  async getById(id: string): Promise<PlanResponse> {
    const plan = await this.repo.findItem<PlanWithType>({
      where: { id },
      include: this.include,
    })
    return this.toResponse(plan)
  }

  async create(data: CreatePlanDto): Promise<PlanResponse> {
    const plan = await this.repo.insert<CreatePlanDto, PlanWithType>({
      data,
      include: this.include,
    })
    return this.toResponse(plan)
  }

  async update(id: string, data: UpdatePlanDto): Promise<PlanResponse> {
    const plan = await this.repo.updateItem<UpdatePlanDto, PlanWithType>({
      where: { id },
      data,
      include: this.include,
    })
    return this.toResponse(plan)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
