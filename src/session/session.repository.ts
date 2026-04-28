import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Session } from '@session/entities/session.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CreateSessionDto } from './dtos/create-session.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
    private readonly errorService: ErrorService,
  ) {}

  async create(data: CreateSessionDto): Promise<Session> {
    try {
      const session = this.repository.create(data)
      return await this.repository.save(session)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getListByUserId(userId: string): Promise<Session[]> {
    try {
      return await this.repository.findBy({ userId })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<Session> {
    try {
      const session = await this.repository.findOneBy({ id })
      if (!session) throw new NotFoundException('Session not found')
      return session
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

  async update(id: string, data: UpdateSessionDto): Promise<void> {
    try {
      const session = await this.getById(id)
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
