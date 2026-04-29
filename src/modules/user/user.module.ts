import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Credential } from '@credential/entities/credential.entity'
import { User } from '@user/entities/user.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CredentialsModule } from '@credential/credential.module'
import { PasswordService } from '@shared/services/password/password.service'
import { UserController } from '@user/user.controller'
import { UserRepository } from '@user/user.repository'
import { UserService } from '@user/user.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Credential]), CredentialsModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, ErrorService, PasswordService],
  exports: [UserService, UserRepository],
})
export class UserModule {}
