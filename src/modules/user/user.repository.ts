import { Injectable, NotFoundException } from '@nestjs/common'

import { User } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import {
  PaginationService,
} from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UserQueryDto } from './dtos/user-query.dto'
import { UserFull } from './types/user-full.type'
import { UserOrderBy } from './types/user-order-by.type'
import { UserPaginatedResponse } from './types/user-paginated-response.type'
import { UserResponse } from './types/user-response.type'

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
    private readonly paginationService: PaginationService,
  ) {}

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

  async create(data: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getAll(query: UserQueryDto): Promise<UserPaginatedResponse> {
    try {
      const params = this.paginationService.getPaginationParams(query)
      const orderBy = query.orderBy ?? UserOrderBy.NAME
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: { deletedAt: null },
          orderBy: { [orderBy]: query.orderDir?.toLowerCase() ?? 'asc' },
          include: { globalRole: true, credentials: true },
          skip: params.skip,
          take: params.take,
        }),
        this.prisma.user.count({ where: { deletedAt: null } }),
      ])
      return this.paginationService.paginate(
        users.map((u) => this.toResponse(u)),
        total,
        query,
      )
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, deletedAt: null },
        include: { globalRole: true, credentials: true },
      })
      if (!user) throw new NotFoundException('User not found')
      return this.toResponse(user)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByCompanyId(companyId: string): Promise<UserResponse[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          userTenants: { some: { tenant: { companyId } } },
          deletedAt: null,
        },
        include: { globalRole: true, credentials: true },
      })
      return users.map((u) => this.toResponse(u))
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateUserDto): Promise<void> {
    try {
      const exists = await this.prisma.user.findFirst({
        where: { id, deletedAt: null },
      })
      if (!exists) throw new NotFoundException('User not found')
      await this.prisma.user.update({ where: { id }, data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.getById(id)
      await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
