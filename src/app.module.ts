import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { join } from 'path'

import { AuthModule } from '@auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { NotificationTypeModule } from '@notification-type/notification-type.module'
import { PlanModule } from '@plan/plan.module'
import { RoleModule } from '@role/role.module'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { SubscriptionStatusModule } from '@subscription-status/subscription-status.module'
import { UserModule } from '@user/user.module'
import { AppService } from './app.service'
import { MocksModule } from './mocks/mocks.module';

@Module({
  imports: [
    AuthModule,
    PlanModule,
    PrismaModule,
    NotificationTypeModule,
    RoleModule,
    SubscriptionStatusModule,
    UserModule,
    MocksModule,
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
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
