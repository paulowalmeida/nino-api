import { Injectable } from '@nestjs/common'

import { BaseService } from '@shared/services/base/base.service'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UserQueryDto } from './dtos/user-query.dto'
import { UserPaginatedResponse } from './types/user-paginated-response.type'
import { UserRepository } from './user.repository'
import { UserResponse } from './types/user-response.type'

@Injectable()
export class UserService extends BaseService<
  UserResponse,
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserPaginatedResponse
> {
  constructor(private repo: UserRepository) {
    super(repo)
  }

  async getByCompanyId(companyId: string): Promise<UserResponse[]> {
    return this.repo.getByCompanyId(companyId)
  }
}
