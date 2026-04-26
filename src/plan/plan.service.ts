import { Injectable } from '@nestjs/common'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanRepository } from './plan.repository'
import { Plan } from './types/plan.type'

@Injectable()
export class PlanService {
  constructor(private readonly planRepository: PlanRepository) {}

  async create(createDto: CreatePlanDto): Promise<Plan> {
    return this.planRepository.create(createDto)
  }

  async getAll(): Promise<Plan[]> {
    return this.planRepository.getAll()
  }

  async getById(id: number): Promise<Plan> {
    return this.planRepository.getById(id)
  }

  async update(id: number, updateDto: UpdatePlanDto): Promise<void> {
    return this.planRepository.update(id, updateDto)
  }

  async delete(id: number): Promise<void> {
    return this.planRepository.delete(id)
  }
}
