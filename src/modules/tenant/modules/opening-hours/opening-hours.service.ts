import { Injectable } from '@nestjs/common'

import { OpeningHours } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CreateOpeningHoursDto } from './dtos/create-opening-hours.dto'
import { UpdateOpeningHoursDto } from './dtos/update-opening-hours.dto'
import { OpeningHoursRepository } from './opening-hours.repository'

@Injectable()
export class OpeningHoursService extends BaseService<
  OpeningHours,
  CreateOpeningHoursDto,
  UpdateOpeningHoursDto,
  string
> {
  constructor(private readonly repo: OpeningHoursRepository) {
    super(repo)
  }
}
