import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { join } from 'path'

import { AuthModule } from '@auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { CompanyResponsibleModule } from '@company-responsible/company-responsible.module'
import { NotificationTypeModule } from '@notification-type/notification-type.module'
import { PlanModule } from '@plan/plan.module'
import { RoleModule } from '@role/role.module'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { SubscriptionStatusModule } from '@subscription-status/subscription-status.module'
import { TenantStatusModule } from '@tenant-status/tenant-status.module'
import { UserModule } from '@user/user.module'
import { AppService } from './app.service'
import { MocksModule } from './mocks/mocks.module'
import { InvoiceStatusModule } from './invoice-status/invoice-status.module'
import { PlanTypeModule } from './plan-type/plan-type.module'
import { CompanyModule } from './company/company.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    AuthModule,
    CompanyResponsibleModule,
    InvoiceStatusModule,
    MocksModule,
    NotificationTypeModule,
    PlanModule,
    PlanTypeModule,
    PrismaModule,
    RoleModule,
    SubscriptionStatusModule,
    TenantStatusModule,
    UserModule,
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
    CompanyModule,
    SessionModule,
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
