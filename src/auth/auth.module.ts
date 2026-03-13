import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '@auth/auth.controller';
import { AuthRepository } from '@auth/auth.repository';
import { AuthService } from '@auth/auth.service';
import { PrismaModule } from '@shared/services/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository]
})
export class AuthModule { }
