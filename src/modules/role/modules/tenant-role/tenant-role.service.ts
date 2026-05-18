import { Injectable } from '@nestjs/common'

import { TenantRole } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CreateTenantRoleDto } from './dtos/create-tenant-role.dto'
import { UpdateTenantRoleDto } from './dtos/update-tenant-role.dto'
import { TenantRoleRepository } from './tenant-role.repository'

@Injectable()
export class TenantRoleService extends BaseService<
  TenantRole,
  CreateTenantRoleDto,
  UpdateTenantRoleDto
> {
  constructor(private repo: TenantRoleRepository) {
    super(repo)
  }

  async getByName(name: string): Promise<TenantRole> {
    return this.repo.getByName(name)
  }
}
