import { Injectable } from '@nestjs/common'

import { BusinessCategory } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { BusinessCategoryRepository } from './business-category.repository'
import { BusinessCategoryQueryDto } from './dtos/business-category-query.dto'
import { CreateBusinessCategoryDto } from './dtos/create-business-category.dto'
import { UpdateBusinessCategoryDto } from './dtos/update-business-category.dto'
import { BusinessCategoryPaginatedResponse } from './types/business-category-paginated-response.type'

@Injectable()
export class BusinessCategoryService extends BaseService<
  BusinessCategory,
  CreateBusinessCategoryDto,
  UpdateBusinessCategoryDto,
  BusinessCategoryQueryDto,
  BusinessCategoryPaginatedResponse
> {
  constructor(repo: BusinessCategoryRepository) {
    super(repo)
  }
}
