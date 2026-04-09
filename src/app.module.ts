import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { join } from 'path'

import { AuthModule } from '@auth/auth.module'
import { PrismaModule } from '@shared/services/prisma/prisma.module'

import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 10, // 10 requisições por minuto
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [AppController, UsersController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    UsersService,
  ],
})
export class AppModule {}
