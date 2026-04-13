import { Module } from '@nestjs/common'

import { AccountController } from '@account/account.controller'
import { AccountRepository } from '@account/account.repository'
import { AccountService } from '@account/account.service'
import { CredentialsModule } from '@credential/credential.module'
import { PrismaModule } from '@shared/services/prisma/prisma.module'

@Module({
  imports: [PrismaModule, CredentialsModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountRepository],
})
export class AccountModule {}
