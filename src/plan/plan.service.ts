import { Injectable } from '@nestjs/common'

import { PlanRepository } from './plan.repository'
import { Plan } from './types/plan.type'

@Injectable()
export class PlanService {
  constructor(private readonly planRepository: PlanRepository) {}

  async getAll(): Promise<Plan[]> {
    return await this.planRepository.findAll()
  }

  async getAllIncludeInactive(): Promise<Plan[]> {
    return await this.planRepository.findAllIncludeInactive()
  }

  async getById(id: string): Promise<Plan> {
    return await this.planRepository.findById(id)
  }

  async getByCode(code: number): Promise<Plan> {
    return await this.planRepository.findByCode(code)
  }

  async getBySlug(slug: string): Promise<Plan> {
    return await this.planRepository.findBySlug(slug)
  }
}
