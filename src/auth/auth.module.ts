import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from '@auth/auth.controller'
import { AuthRepository } from '@auth/auth.repository'
import { JwtRefreshStrategy } from '@auth/jwt-refresh.strategy'
import { AuthService } from '@auth/services/auth.service'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { JwtAuthStrategy } from '@shared/strategies/jwt-auth.strategy'

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthStrategy, JwtRefreshStrategy],
  exports: [JwtAuthStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
