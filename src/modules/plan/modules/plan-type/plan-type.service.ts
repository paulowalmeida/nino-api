import { Injectable } from '@nestjs/common'

import { PlanType } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'
import { PlanTypeRepository } from './plan-type.repository'

@Injectable()
export class PlanTypeService extends BaseService<
  PlanType,
  CreatePlanTypeDto,
  UpdatePlanTypeDto
> {
  constructor(repo: PlanTypeRepository) {
    super(repo)
  }
}
