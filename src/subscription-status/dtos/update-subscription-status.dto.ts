import { PartialType } from '@nestjs/mapped-types'

import { CreateSubscriptionStatusDto } from './create-subscription-status.dto'

export class UpdateSubscriptionStatusDto extends PartialType(
  CreateSubscriptionStatusDto,
) {}
