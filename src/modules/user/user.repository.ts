import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UserQueryDto } from './dtos/user-query.dto'
import { UserFull } from './types/user-full.type'
import { UserOrderBy } from './types/user-order-by.type'
import { UserPaginatedResponse } from './types/user-paginated-response.type'
import { UserResponse } from './types/user-response.type'

@Injectable()
export class UserRepository
  extends BaseRepository<Prisma.UserDelegate>
  implements IBaseLookupRepository<
    UserResponse,
    CreateUserDto,
    UpdateUserDto,
    UserQueryDto,
    UserPaginatedResponse
  > {
  constructor(
    prisma: PrismaService,
    paginationService: PaginationService,
    errorService: ErrorService,
  ) {
    super(errorService, prisma.user, 'User', paginationService)
  }

  private toResponse(user: UserFull): UserResponse {
    const {
      deletedAt: _,
      globalRoleId: _r,
      globalRole: role,
      credentials: rawCredentials,
      ...rest
    } = user
    const credentials = rawCredentials.map(
      ({ password: _p, deletedAt: _d, ...c }) => c,
    )
    return { ...rest, role, credentials }
  }

  async create(data: CreateUserDto): Promise<UserResponse> {
    const user = await this.insert<CreateUserDto, UserFull>({
      data,
      include: { globalRole: true, credentials: true },
    })
    return this.toResponse(user)
  }

  async getAll(query: UserQueryDto): Promise<UserPaginatedResponse> {
    const orderBy = query.orderBy ?? UserOrderBy.NAME
    const result = await this.findAllPaginated<UserFull>({
      page: query.page ?? 1,
      size: query.size ?? 10,
      orderBy: { [orderBy]: query.orderDir?.toLowerCase() ?? 'asc' },
      include: { globalRole: true, credentials: true },
    })
    return { ...result, data: result.data.map((u) => this.toResponse(u)) }
  }

  async getById(id: string): Promise<UserResponse> {
    const user = await this.findItem<UserFull>({
      where: { id },
      include: { globalRole: true, credentials: true },
    })
    return this.toResponse(user)
  }

  async getByCompanyId(companyId: string): Promise<UserResponse[]> {
    const users = await this.findAll<UserFull>({
      where: { userTenants: { some: { tenant: { companyId } } } },
      include: { globalRole: true, credentials: true },
    })
    return users.map((u) => this.toResponse(u))
  }

  async update(id: string, data: UpdateUserDto): Promise<UserResponse> {
    const updated = await this.updateItem<UpdateUserDto, UserFull>({
      where: { id },
      data,
      include: { globalRole: true, credentials: true },
    })
    return this.toResponse(updated)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
