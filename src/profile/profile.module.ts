import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthModule } from '@auth/auth.module'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { ProfilesController } from './profile.controller'
import { ProfileRepository } from './profile.repository'
import { ProfileService } from './profile.service'

@Module({
  imports: [PrismaModule, JwtModule.register({}), AuthModule],
  controllers: [ProfilesController],
  providers: [ProfileService, ProfileRepository, JwtAuthGuard],
})
export class ProfileModule {}
