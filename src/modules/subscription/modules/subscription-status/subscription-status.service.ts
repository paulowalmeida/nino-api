import { Injectable } from '@nestjs/common'

import { SubscriptionStatus } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CreateSubscriptionStatusDto } from './dtos/create-subscription-status.dto'
import { UpdateSubscriptionStatusDto } from './dtos/update-subscription-status.dto'
import { SubscriptionStatusRepository } from './subscription-status.repository'

@Injectable()
export class SubscriptionStatusService extends BaseService<
  SubscriptionStatus,
  CreateSubscriptionStatusDto,
  UpdateSubscriptionStatusDto
> {
  constructor(repo: SubscriptionStatusRepository) {
    super(repo)
  }
}
