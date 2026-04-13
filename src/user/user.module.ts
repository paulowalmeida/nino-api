import { Module } from '@nestjs/common'

import { CredentialsModule } from '@credential/credential.module'
import { PasswordService } from '@shared/services/password/password.service'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { UserController } from '@user/user.controller'
import { UserRepository } from '@user/user.repository'
import { UserService } from '@user/user.service'

@Module({
  imports: [PrismaModule, CredentialsModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, PasswordService],
  exports: [UserRepository],
})
export class UserModule {}
