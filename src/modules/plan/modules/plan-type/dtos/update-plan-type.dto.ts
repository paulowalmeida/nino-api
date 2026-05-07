import { PartialType } from '@nestjs/mapped-types'

import { CreatePlanTypeDto } from './create-plan-type.dto'

export class UpdatePlanTypeDto extends PartialType(CreatePlanTypeDto) {}
