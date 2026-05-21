import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { SessionController } from './session.controller'
import { SessionRepository } from './session.repository'
import { SessionService } from './session.service'

@Module({
  controllers: [SessionController],
  providers: [
    SessionService,
    SessionRepository,
    ErrorService,
    PaginationService,
  ],
  exports: [SessionService],
})
export class SessionModule {}
