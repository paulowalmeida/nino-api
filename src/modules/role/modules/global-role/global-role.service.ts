import { Injectable } from '@nestjs/common'

import { GlobalRole } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CreateGlobalRoleDto } from './dtos/create-global-role.dto'
import { UpdateGlobalRoleDto } from './dtos/update-global-role.dto'
import { GlobalRoleRepository } from './global-role.repository'

@Injectable()
export class GlobalRoleService extends BaseService<
  GlobalRole,
  CreateGlobalRoleDto,
  UpdateGlobalRoleDto
> {
  constructor(private repo: GlobalRoleRepository) {
    super(repo)
  }

  async getByName(name: string): Promise<GlobalRole> {
    return this.repo.getByName(name)
  }
}
