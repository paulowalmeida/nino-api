import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Session } from '@session/entities/session.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { SessionController } from './session.controller'
import { SessionRepository } from './session.repository'
import { SessionService } from './session.service'

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository, ErrorService],
  exports: [SessionService],
})
export class SessionModule {}
