import { PartialType } from '@nestjs/mapped-types'

import { CreateBusinessCategoryDto } from './create-business-category.dto'

export class UpdateBusinessCategoryDto extends PartialType(
  CreateBusinessCategoryDto,
) {}
