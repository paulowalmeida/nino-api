import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import { join } from 'path'

import { AuthModule } from '@auth/auth.module'
import {
  CompanyResponsibleModule,
} from '@company/modules/company-responsible/company-responsible.module'
import { CompanyModule } from '@company/company.module'
import { CredentialsModule } from '@credential/credential.module'
import { HealthModule } from '@health/health.module'
import { InvoiceStatusModule } from 'src/modules/invoice/modules/invoice-status/invoice-status.module'
import { MocksModule } from '@mocks/mocks.module'
import {
  NotificationTypeModule,
} from 'src/modules/notification/modules/notification-type/notification-type.module'
import { PlanTypeModule } from '@plan/modules/plan-type/plan-type.module'
import { PlanModule } from '@plan/plan.module'
import { GlobalRoleModule } from '@role/modules/global-role/global-role.module'
import { TenantRoleModule } from '@role/modules/tenant-role/tenant-role.module'
import { SessionModule } from '@session/session.module'
import { PrismaModule } from '@shared/services/prisma/prisma.module'
import {
  SubscriptionStatusModule,
} from 'src/modules/subscription/modules/subscription-status/subscription-status.module'
import { CustomerModule } from 'src/modules/customer/customer.module'
import { TenantModule } from '@tenant/tenant.module'
import { UserTenantModule } from '@user/modules/user-tenant/user-tenant.module'
import { UserModule } from '@user/user.module'
import { AppService } from './app.service'

@Module({
  imports: [
    AuthModule,
    CompanyResponsibleModule,
    CompanyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    CredentialsModule,
    GlobalRoleModule,
    HealthModule,
    InvoiceStatusModule,
    MocksModule,
    NotificationTypeModule,
    PlanModule,
    PlanTypeModule,
    PrismaModule,
    SessionModule,
    SubscriptionStatusModule,
    TenantRoleModule,
    CustomerModule,
    TenantModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    UserModule,
    UserTenantModule,
  ],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
