import { Injectable } from '@nestjs/common'

import { Session } from './entities/session.entity'
import { CreateSessionDto } from './dtos/create-session.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'
import { SessionRepository } from './session.repository'
import { SessionResponse } from './types/session.response.type'

@Injectable()
export class SessionService {
  constructor(private readonly sessionsRepository: SessionRepository) {}

  async create(createDto: CreateSessionDto): Promise<Session> {
    return this.sessionsRepository.create(createDto)
  }

  async getListByUserId(userId: string): Promise<SessionResponse[]> {
    return this.sessionsRepository.getListByUserId(userId)
  }

  async getById(id: string): Promise<SessionResponse> {
    return this.sessionsRepository.getById(id)
  }

  async getByRefreshToken(refreshToken: string): Promise<Session> {
    return this.sessionsRepository.getByRefreshToken(refreshToken)
  }

  async update(id: string, updateDto: UpdateSessionDto): Promise<void> {
    return this.sessionsRepository.update(id, updateDto)
  }

  async delete(id: string): Promise<void> {
    return this.sessionsRepository.delete(id)
  }
}
