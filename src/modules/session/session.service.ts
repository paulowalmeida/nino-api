import { Injectable, NotFoundException } from '@nestjs/common'

import { Session } from '@prisma/client'

import { SessionRepository } from './session.repository'
import { CreateSessionDto } from './dtos/create-session.dto'
import { SessionQueryDto } from './dtos/session-query.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'
import { SessionFull } from './types/session-full.type'
import { SessionPaginatedResponse } from './types/session-paginated-response.type'
import { SessionResponse } from './types/session.response.type'

@Injectable()
export class SessionService {
  private readonly include = {
    user: { include: { globalRole: true, credentials: true } },
  } as const

  constructor(private readonly repo: SessionRepository) {}

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
    return this.repo.insert<CreateSessionDto, Session>({ data })
  }

  async getAll(query: SessionQueryDto): Promise<SessionPaginatedResponse> {
    const result = await this.repo.findAllPaginated<SessionFull>({
      page: query.page,
      size: query.size,
      order: { 
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc'
      },
      include: this.include,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((s) => this.toResponse(s)) }
  }

  async getListByUserId(
    userId: string,
    query: SessionQueryDto,
  ): Promise<SessionPaginatedResponse> {
    const result = await this.repo.findAllPaginated<SessionFull>({
      page: query.page,
      size: query.size,
      where: { userId },
      order: { target: query.target ?? 'createdAt', direction: query.direction ?? 'asc' },
      include: this.include,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((s) => this.toResponse(s)) }
  }

  async getById(id: string): Promise<SessionResponse> {
    const session = await this.repo.findItem<SessionFull>({
      where: { id },
      include: this.include,
      ignoreDeleted: true,
    })
    return this.toResponse(session)
  }

  async getByRefreshToken(refreshToken: string): Promise<Session> {
    return this.repo.findItem<Session>({
      where: { refreshToken },
      ignoreDeleted: true,
    })
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.repo
      .findItem<Session>({ where: { refreshToken }, ignoreDeleted: true })
      .catch((e: unknown) => {
        if (e instanceof NotFoundException) return null
        throw e
      })
  }

  async deleteAllByUserId(userId: string): Promise<{ message: string }> {
    await this.repo.deleteMany({ userId })
    return { message: 'Sessions deleted successfully' }
  }

  async update(id: string, data: UpdateSessionDto): Promise<SessionResponse> {
    await this.repo.updateItem<UpdateSessionDto, Session>({
      where: { id },
      data,
    })
    return this.getById(id)
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.repo.deleteMany({ id })
    return { message: 'Session deleted successfully' }
  }
}
