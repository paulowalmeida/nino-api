import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class CompanyBusinessCategoryRepository extends BaseRepository<Prisma.CompanyBusinessCategoryDelegate> {
  constructor(
    prisma: PrismaService,
    errorService: ErrorService,
    paginationService: PaginationService,
  ) {
    super(
      errorService,
      prisma.companyBusinessCategory,
      'Company Business Category',
      paginationService,
    )
  }
}
