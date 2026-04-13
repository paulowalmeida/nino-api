import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthModule } from '@auth/auth.module'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { UsersController } from './user.controller'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
  imports: [PrismaModule, JwtModule.register({}), AuthModule],
  controllers: [UsersController],
  providers: [UserService, UserRepository, JwtAuthGuard],
})
export class UserModule {}
