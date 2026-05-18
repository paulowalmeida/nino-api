import { Injectable } from '@nestjs/common'

import { TenantStatus } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CreateTenantStatusDto } from './dtos/create-tenant-status.dto'
import { UpdateTenantStatusDto } from './dtos/update-tenant-status.dto'
import { TenantStatusRepository } from './tenant-status.repository'

@Injectable()
export class TenantStatusService extends BaseService<
  TenantStatus,
  CreateTenantStatusDto,
  UpdateTenantStatusDto
> {
  constructor(repo: TenantStatusRepository) {
    super(repo)
  }
}
