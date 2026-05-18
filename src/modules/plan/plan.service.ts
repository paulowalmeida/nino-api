import { Injectable } from '@nestjs/common'

import { BaseService } from '@shared/services/base/base.service'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanRepository } from './plan.repository'
import { PlanResponse } from './types/plan.response.type'

@Injectable()
export class PlanService extends BaseService<
  PlanResponse,
  CreatePlanDto,
  UpdatePlanDto
> {
  constructor(repo: PlanRepository) {
    super(repo)
  }
}
