import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { Credential } from '@credential/entities/credential.entity'
import { Session } from './entities/session.entity'
import { SessionController } from './session.controller'
import { SessionRepository } from './session.repository'
import { SessionService } from './session.service'

@Module({
  imports: [TypeOrmModule.forFeature([Session, Credential])],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository, ErrorService, PaginationService],
  exports: [SessionService],
})
export class SessionModule {}
