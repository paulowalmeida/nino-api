import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PasswordService } from '@shared/services/password/password.service'
import { CredentialsRepository } from './credential.repository'
import { CredentialsService } from './credential.service'

@Module({
  providers: [
    CredentialsService,
    CredentialsRepository,
    ErrorService,
    PasswordService,
  ],
  exports: [CredentialsService],
})
export class CredentialsModule {}
