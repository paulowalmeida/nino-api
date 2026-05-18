import { Injectable, NotFoundException } from '@nestjs/common'

import { Session, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateSessionDto } from './dtos/create-session.dto'
import { SessionQueryDto } from './dtos/session-query.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'
import { SessionFull } from './types/session-full.type'
import { SessionOrderBy } from './types/session-order-by.type'
import { SessionPaginatedResponse } from './types/session-paginated-response.type'
import { SessionResponse } from './types/session.response.type'

@Injectable()
export class SessionRepository
  extends BaseRepository<Prisma.SessionDelegate> {
  private readonly SESSION_INCLUDE = {
    user: { include: { globalRole: true, credentials: true } },
  } as const

  constructor(
    prisma: PrismaService,
    paginationService: PaginationService,
    errorService: ErrorService,
  ) {
    super(errorService, prisma.session, 'Session', paginationService)
  }

  private toResponse(session: SessionFull): SessionResponse {
    const { refreshToken: _, userId: __, ...rest } = session
    const {
      deletedAt: _d,
      globalRoleId: _rid,
      globalRole: role,
      credentials: rawCredentials,
      ...userRest
    } = session.user
    return {
      ...rest,
      user: {
        ...userRest,
        role,
        credentials: rawCredentials.map(
          ({ password: _p, deletedAt: _cd, ...c }) => c,
        ),
      },
    }
  }

  async create(data: CreateSessionDto): Promise<Session> {
    return this.insert<CreateSessionDto, Session>({ data })
  }

  private buildOrderBy(query: SessionQueryDto): Record<string, string> {
    return {
      [query.orderBy ?? SessionOrderBy.CREATED_AT]:
        query.orderDir?.toLowerCase() ?? 'asc',
    }
  }

  async getListByUserId(
    userId: string,
    query: SessionQueryDto,
  ): Promise<SessionPaginatedResponse> {
    const result = await this.findAllPaginated<SessionFull>({
      page: query.page ?? 1,
      size: query.size ?? 10,
      where: { userId },
      orderBy: this.buildOrderBy(query),
      include: this.SESSION_INCLUDE,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((s) => this.toResponse(s)) }
  }

  async getById(id: string): Promise<SessionResponse> {
    const session = await this.findItem<SessionFull>({
      where: { id },
      include: this.SESSION_INCLUDE,
      ignoreDeleted: true,
    })
    return this.toResponse(session)
  }

  async getByRefreshToken(refreshToken: string): Promise<Session> {
    return this.findItem<Session>({
      where: { refreshToken },
      ignoreDeleted: true,
    })
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.findItem<Session>({
      where: { refreshToken },
      ignoreDeleted: true,
    }).catch((e: unknown) => {
      if (e instanceof NotFoundException) return null
      throw e
    })
  }

  async deleteAllByUserId(userId: string): Promise<{ message: string }> {
    await this.deleteMany({ userId })
    return { message: 'Sessions deleted successfully' }
  }

  async update(id: string, data: UpdateSessionDto): Promise<Session> {
    return this.updateItem<UpdateSessionDto, Session>({ where: { id }, data })
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.deleteMany({ id })
    return { message: 'Session deleted successfully' }
  }
}
