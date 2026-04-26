import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateSessionDto } from './dtos/create-session.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'
import { Session } from './types/session.type'

@Injectable()
export class SessionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async create(data: CreateSessionDto): Promise<Session> {
    try {
      return await this.prisma.session.create({ data })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getListByUserId(userId: string): Promise<Session[]> {
    try {
      return await this.prisma.session.findMany({
        where: { userId },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<Session> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id },
      })

      if (!session) throw new NotFoundException('Session not found')

      return session
    } catch (error) {
      this.prismaErrorService.handleError(error)
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
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, data: UpdateSessionDto): Promise<void> {
    try {
      await this.prisma.session.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.session.delete({
        where: { id },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
