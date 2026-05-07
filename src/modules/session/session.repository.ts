import { Injectable, NotFoundException } from '@nestjs/common'

import { Session } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import {
  PaginationService,
} from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateSessionDto } from './dtos/create-session.dto'
import { SessionQueryDto } from './dtos/session-query.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'
import { SessionFull } from './types/session-full.type'
import { SessionOrderBy } from './types/session-order-by.type'
import {
  SessionPaginatedResponse,
} from './types/session-paginated-response.type'
import { SessionResponse } from './types/session.response.type'

@Injectable()
export class SessionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
    private readonly paginationService: PaginationService,
  ) {}

  private async toResponse(
    session: SessionFull,
  ): Promise<SessionResponse> {
    const { refreshToken: _, userId: __, ...rest } = session
    const credentials = await this.prisma.credential.findMany({
      where: { userId: session.userId, deletedAt: null },
    })
    const {
      deletedAt: _d,
      globalRoleId: _rid,
      globalRole: role,
      ...userRest
    } = session.user
    return {
      ...rest,
      user: {
        ...userRest,
        role,
        credentials: credentials.map(
          ({ password: _p, deletedAt: _cd, ...c }) => c,
        ),
      },
    }
  }

  async create(data: CreateSessionDto): Promise<Session> {
    try {
      return await this.prisma.session.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getListByUserId(
    userId: string,
    query: SessionQueryDto,
  ): Promise<SessionPaginatedResponse> {
    try {
      const params = this.paginationService.getPaginationParams(query)
      const orderBy = query.orderBy ?? SessionOrderBy.CREATED_AT
      const [items, total] = await Promise.all([
        this.prisma.session.findMany({
          where: { userId },
          orderBy: { [orderBy]: query.orderDir?.toLowerCase() ?? 'asc' },
          include: { user: { include: { globalRole: true } } },
          skip: params.skip,
          take: params.take,
        }),
        this.prisma.session.count({ where: { userId } }),
      ])
      const data = await Promise.all(
        items.map((s) => this.toResponse(s as SessionFull)),
      )
      return this.paginationService.paginate(data, total, query)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<SessionResponse> {
    try {
      const session = await this.prisma.session.findFirst({
        where: { id },
        include: { user: { include: { globalRole: true } } },
      })
      if (!session) throw new NotFoundException('Session not found')
      return this.toResponse(session as SessionFull)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByRefreshToken(refreshToken: string): Promise<Session> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { refreshToken },
      })
      if (!session) throw new NotFoundException('Session not found')
      return session
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async findByRefreshToken(
    refreshToken: string,
  ): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { refreshToken } })
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    try {
      await this.prisma.session.deleteMany({ where: { userId } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateSessionDto): Promise<void> {
    try {
      const exists = await this.prisma.session.findUnique({
        where: { id },
      })
      if (!exists) throw new NotFoundException('Session not found')
      await this.prisma.session.update({ where: { id }, data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.getById(id)
      await this.prisma.session.delete({ where: { id } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
