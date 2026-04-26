import { Module } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { SessionController } from './session.controller'
import { SessionRepository } from './session.repository'
import { SessionService } from './session.service'

@Module({
  controllers: [SessionController],
  providers: [
    SessionService,
    SessionRepository,
    PrismaService,
    PrismaErrorService,
  ],
})
export class SessionModule {}
