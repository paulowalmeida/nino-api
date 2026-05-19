import { Injectable } from '@nestjs/common'

import { BaseService } from '@shared/services/base/base.service'
import { CreateTenantPhoneDto } from './dtos/create-tenant-phone.dto'
import { UpdateTenantPhoneDto } from './dtos/update-tenant-phone.dto'
import { TenantPhoneRepository } from './tenant-phone.repository'

import { TenantPhone } from '@prisma/client'

@Injectable()
export class TenantPhoneService extends BaseService<
  TenantPhone,
  CreateTenantPhoneDto,
  UpdateTenantPhoneDto,
  string
> {
  constructor(private readonly repo: TenantPhoneRepository) {
    super(repo)
  }
}
