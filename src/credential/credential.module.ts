import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthCredential } from '@credential/entities/auth-credential.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { PasswordService } from '@shared/services/password/password.service'
import { CredentialController } from './credential.controller'
import { CredentialsRepository } from './credential.repository'
import { CredentialsService } from './credential.service'

@Module({
  imports: [TypeOrmModule.forFeature([AuthCredential])],
  controllers: [CredentialController],
  providers: [CredentialsService, CredentialsRepository, ErrorService, PasswordService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
