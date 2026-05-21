import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class UserTenantRepository extends BaseRepository<Prisma.UserTenantDelegate> {
  constructor(
    prisma: PrismaService,
    paginationService: PaginationService,
    errorService: ErrorService,
  ) {
    super(errorService, prisma.userTenant, 'User Tenant', paginationService)
  }
}
