import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PasswordService } from '@shared/services/password/password.service'
import { CredentialRepository } from './credential.repository'
import { CredentialsService } from './credential.service'

@Module({
  providers: [
    CredentialsService,
    CredentialRepository,
    ErrorService,
    PaginationService,
    PasswordService,
  ],
  exports: [CredentialsService],
})
export class CredentialsModule {}
