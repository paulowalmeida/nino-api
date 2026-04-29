import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { PasswordService } from '@shared/services/password/password.service'
import { CredentialsRepository } from './credential.repository'
import { CredentialsService } from './credential.service'
import { Credential } from './entities/credential.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Credential])],
  providers: [
    CredentialsService,
    CredentialsRepository,
    ErrorService,
    PasswordService,
  ],
  exports: [CredentialsService],
})
export class CredentialsModule {}
