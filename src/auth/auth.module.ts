import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from '@auth/auth.controller'
import { AuthRepository } from '@auth/auth.repository'
import { AuthService } from '@auth/auth.service'
import { JwtAuthStrategy } from '@shared/strategies/jwt-auth.strategy'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthStrategy, JwtRefreshStrategy],
  exports: [JwtAuthStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
