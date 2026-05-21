import { Module } from '@nestjs/common'

import { CredentialsModule } from '@credential/credential.module'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PasswordService } from '@shared/services/password/password.service'
import { UserController } from '@user/user.controller'
import { UserRepository } from '@user/user.repository'
import { UserService } from '@user/user.service'

@Module({
  imports: [CredentialsModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    ErrorService,
    PasswordService,
    PaginationService,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
