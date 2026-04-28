import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from '@auth/auth.controller'
import { AuthService } from '@auth/auth.service'
import { JwtRefreshStrategy } from '@auth/jwt-refresh.strategy'
import { CredentialsModule } from '@credential/credential.module'
import { PasswordService } from '@shared/services/password/password.service'
import { TokenService } from '@shared/services/token/token.service'
import { JwtAuthStrategy } from '@shared/strategies/jwt-auth.strategy'
import { RoleModule } from '@role/role.module'
import { SessionModule } from '@session/session.module'
import { UserModule } from '@user/user.module'

@Module({
  imports: [JwtModule.register({}), UserModule, CredentialsModule, SessionModule, RoleModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthStrategy,
    JwtRefreshStrategy,
    PasswordService,
    TokenService,
  ],
  exports: [JwtAuthStrategy, JwtRefreshStrategy, PasswordService],
})
export class AuthModule {}
