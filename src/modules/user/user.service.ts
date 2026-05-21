import { Injectable } from '@nestjs/common'

import { UserRepository } from './user.repository'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UserQueryDto } from './dtos/user-query.dto'
import { UserFull } from './types/user-full.type'
import { UserPaginatedResponse } from './types/user-paginated-response.type'
import { UserResponse } from './types/user-response.type'

@Injectable()
export class UserService {
  private readonly include = { globalRole: true, credentials: true } as const

  constructor(private readonly repo: UserRepository) {}

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
    const user = await this.repo.insert<CreateUserDto, UserFull>({
      data,
      include: this.include,
    })
    return this.toResponse(user)
  }

  async getAll(query: UserQueryDto): Promise<UserPaginatedResponse> {
    const result = await this.repo.findAllPaginated<UserFull>({
      page: query.page,
      size: query.size,
      order: {
        target: query.orderBy ?? 'name',
        direction: query.direction ?? 'asc',
      },
      include: this.include,
    })
    return { ...result, data: result.data.map((u) => this.toResponse(u)) }
  }

  async getById(id: string): Promise<UserResponse> {
    const user = await this.repo.findItem<UserFull>({
      where: { id },
      include: this.include,
    })
    return this.toResponse(user)
  }

  async getByCompanyId(companyId: string): Promise<UserResponse[]> {
    const users = await this.repo.findAll<UserFull>({
      where: { userTenants: { some: { tenant: { companyId } } } },
      include: this.include,
    })
    return users.map((u) => this.toResponse(u))
  }

  async update(id: string, data: UpdateUserDto): Promise<UserResponse> {
    const user = await this.repo.updateItem<UpdateUserDto, UserFull>({
      where: { id },
      data,
      include: this.include,
    })
    return this.toResponse(user)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
