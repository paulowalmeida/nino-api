import { Injectable } from '@nestjs/common'

import { PlanType } from '@prisma/client'

import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'
import { PlanTypeRepository } from './plan-type.repository'

@Injectable()
export class PlanTypeService {
  constructor(private repo: PlanTypeRepository) {}

  async getAll(): Promise<PlanType[]> {
    return await this.repo.getAll()
  }

  async getById(id: string): Promise<PlanType> {
    return await this.repo.getById(id)
  }

  async create(data: CreatePlanTypeDto): Promise<PlanType> {
    return this.repo.create(data)
  }

  async update(id: string, data: UpdatePlanTypeDto): Promise<PlanType> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
