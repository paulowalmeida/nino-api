import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PasswordService } from '@shared/services/password/password.service'
import { CredentialRepository } from './credential.repository'
import { CredentialsService } from './credential.service'

@Module({
  providers: [
    CredentialsService,
    CredentialRepository,
    ErrorService,
    PasswordService,
  ],
  exports: [CredentialsService],
})
export class CredentialsModule {}
