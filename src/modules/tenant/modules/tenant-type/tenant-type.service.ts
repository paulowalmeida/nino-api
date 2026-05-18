import { Injectable } from '@nestjs/common'

import { TenantType } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CreateTenantTypeDto } from './dtos/create-tenant-type.dto'
import { UpdateTenantTypeDto } from './dtos/update-tenant-type.dto'
import { TenantTypeRepository } from './tenant-type.repository'

@Injectable()
export class TenantTypeService extends BaseService<
  TenantType,
  CreateTenantTypeDto,
  UpdateTenantTypeDto
> {
  constructor(repo: TenantTypeRepository) {
    super(repo)
  }
}
