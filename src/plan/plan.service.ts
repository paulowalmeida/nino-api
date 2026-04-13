import { Injectable } from '@nestjs/common'

import { Plan } from '@plan/types/plan.type'
import { PlanRepository } from './plan.repository'

@Injectable()
export class PlanService {
  constructor(private readonly planRepository: PlanRepository) {}

  async getAll(): Promise<Plan[]> {
    return await this.planRepository.findAll()
  }

  async getAllIncludeInactive(): Promise<Plan[]> {
    return await this.planRepository.findAllIncludeInactive()
  }

  async getById(id: number): Promise<Plan> {
    return await this.planRepository.findById(id)
  }

  async getBySlug(slug: string): Promise<Plan> {
    return await this.planRepository.findBySlug(slug)
  }
}
