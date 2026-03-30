import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from '@auth/auth.controller'
import { AuthRepository } from '@auth/auth.repository'
import { AuthService } from '@auth/auth.service'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthStrategy],
  exports: [JwtAuthStrategy]
})
export class AuthModule { }
