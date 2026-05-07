import { Injectable } from '@nestjs/common'

import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanRepository } from './plan.repository'
import { PlanResponse } from './types/plan.response.type'

@Injectable()
export class PlanService {
  constructor(private readonly planRepository: PlanRepository) {}

  async create(createDto: CreatePlanDto): Promise<PlanResponse> {
    return this.planRepository.create(createDto)
  }

  async getAll(): Promise<PlanResponse[]> {
    return this.planRepository.getAll()
  }

  async getById(id: string): Promise<PlanResponse> {
    return this.planRepository.getById(id)
  }

  async update(id: string, updateDto: UpdatePlanDto): Promise<void> {
    return this.planRepository.update(id, updateDto)
  }

  async delete(id: string): Promise<void> {
    return this.planRepository.delete(id)
  }
}
