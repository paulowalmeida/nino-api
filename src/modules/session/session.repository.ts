import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { Credential } from '@credential/entities/credential.entity'
import { CreateSessionDto } from './dtos/create-session.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'
import { Session } from './entities/session.entity'
import { SessionResponse } from './types/session.response.type'

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly errorService: ErrorService,
  ) {}

  private async fetchCredentials(userId: string) {
    const items = await this.credentialRepository.find({ where: { userId } })
    return items.map(({ password: _, ...c }) => c)
  }

  async create(data: CreateSessionDto): Promise<Session> {
    try {
      const session = this.repository.create(data)
      return await this.repository.save(session)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getListByUserId(userId: string): Promise<SessionResponse[]> {
    try {
      const items = await this.repository.find({
        where: { userId },
        relations: ['user', 'user.role'],
      })
      return Promise.all(
        items.map(async ({ refreshToken: _, ...rest }) => ({
          ...rest,
          user: {
            ...rest.user,
            credentials: await this.fetchCredentials(rest.user.id),
          },
        })),
      )
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<SessionResponse> {
    try {
      const session = await this.repository.findOne({
        where: { id },
        relations: ['user', 'user.role'],
      })
      if (!session) throw new NotFoundException('Session not found')
      const { refreshToken: _, ...rest } = session
      return {
        ...rest,
        user: {
          ...session.user,
          credentials: await this.fetchCredentials(session.user.id),
        },
      }
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByRefreshToken(refreshToken: string): Promise<Session> {
    try {
      const session = await this.repository.findOneBy({ refreshToken })
      if (!session) throw new NotFoundException('Session not found')
      return session
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.repository.findOneBy({ refreshToken })
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    try {
      await this.repository.delete({ userId })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateSessionDto): Promise<void> {
    try {
      const session = await this.repository.findOne({ where: { id } })
      if (!session) throw new NotFoundException('Session not found')
      Object.assign(session, data)
      await this.repository.save(session)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.getById(id)
      await this.repository.delete(id)
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
