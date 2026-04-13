import { Module } from '@nestjs/common'

import { PasswordService } from '@shared/services/password/password.service'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CredentialController } from './credential.controller'
import { CredentialsRepository } from './credential.repository'
import { CredentialsService } from './credential.service'

@Module({
  controllers: [CredentialController],
  providers: [
    CredentialsService,
    CredentialsRepository,
    PrismaService,
    PrismaErrorService,
    PasswordService,
  ],
  exports: [CredentialsService],
})
export class CredentialsModule {}
