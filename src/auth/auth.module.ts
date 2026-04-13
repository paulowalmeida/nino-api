import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AccountModule } from '@account/account.module'
import { AuthController } from '@auth/auth.controller'
import { AuthService } from '@auth/auth.service'
import { JwtRefreshStrategy } from '@auth/jwt-refresh.strategy'
import { CredentialsModule } from '@credential/credential.module'
import { PasswordService } from '@shared/services/password/password.service'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { TokenService } from '@shared/services/token/token.service'
import { JwtAuthStrategy } from '@shared/strategies/jwt-auth.strategy'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}),
    AccountModule,
    CredentialsModule,
  ],
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
