import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { TypeOrmModule } from '@nestjs/typeorm'

import { join } from 'path'

import { CredentialsModule } from '@credential/credential.module'
import { MocksModule } from '@mocks/mocks.module'
import { AuthModule } from '@auth/auth.module'
import { CompanyResponsibleModule } from '@company-responsible/company-responsible.module'
import { CompanyResponsible } from '@company-responsible/entities/company-responsible.entity'
import { CompanyModule } from '@company/company.module'
import { Company } from '@company/entities/company.entity'
import { Credential } from '@credential/entities/credential.entity'
import { InvoiceStatus } from '@invoice-status/entities/invoice-status.entity'
import { InvoiceStatusModule } from '@invoice-status/invoice-status.module'
import { NotificationType } from '@notification-type/entities/notification-type.entity'
import { NotificationTypeModule } from '@notification-type/notification-type.module'
import { PlanType } from '@plan-type/entities/plan-type.entity'
import { PlanTypeModule } from '@plan-type/plan-type.module'
import { Plan } from '@plan/entities/plan.entity'
import { PlanModule } from '@plan/plan.module'
import { Role } from '@role/entities/role.entity'
import { RoleModule } from '@role/role.module'
import { Session } from '@session/entities/session.entity'
import { SessionModule } from '@session/session.module'
import { SubscriptionStatus } from '@subscription-status/entities/subscription-status.entity'
import { SubscriptionStatusModule } from '@subscription-status/subscription-status.module'
import { TenantStatus } from '@tenant-status/entities/tenant-status.entity'
import { TenantStatusModule } from '@tenant-status/tenant-status.module'
import { UserTenant } from '@user/entities/user-tenant.entity'
import { User } from '@user/entities/user.entity'
import { UserModule } from '@user/user.module'
import { AppService } from './app.service'
import { UserTenantModule } from './modules/user-tenant/user-tenant.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [
          Credential,
          Company,
          CompanyResponsible,
          InvoiceStatus,
          NotificationType,
          Plan,
          PlanType,
          Role,
          Session,
          SubscriptionStatus,
          TenantStatus,
          User,
          UserTenant,
        ],
        synchronize: false,
        logging: false,
      }),
    }),
    AuthModule,
    CompanyResponsibleModule,
    CompanyModule,
    CredentialsModule,
    InvoiceStatusModule,
    MocksModule,
    NotificationTypeModule,
    PlanModule,
    PlanTypeModule,
    RoleModule,
    SessionModule,
    SubscriptionStatusModule,
    TenantStatusModule,
    UserModule,
    UserTenantModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
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
