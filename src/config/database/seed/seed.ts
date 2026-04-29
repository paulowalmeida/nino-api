import * as dotenv from 'dotenv'
import 'reflect-metadata'
import { DataSource, ObjectLiteral, Repository } from 'typeorm'

dotenv.config()

import { InvoiceStatus } from '@invoice-status/entities/invoice-status.entity'
import { NotificationType } from '@notification-type/entities/notification-type.entity'
import { PlanType } from '@plan-type/entities/plan-type.entity'
import { Plan } from '@plan/entities/plan.entity'
import { Role } from '@role/entities/role.entity'
import { SubscriptionStatus } from '@subscription-status/entities/subscription-status.entity'
import { TenantStatus } from '@tenant-status/entities/tenant-status.entity'

import {
  invoiceStatuses,
  notificationTypes,
  planTypes,
  plans,
  roles,
  subscriptionStatuses,
  tenantStatuses,
} from './seed.data'

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  entities: [
    Role,
    TenantStatus,
    SubscriptionStatus,
    InvoiceStatus,
    NotificationType,
    PlanType,
    Plan,
  ],
  synchronize: false,
})

async function upsertByName<T extends ObjectLiteral>(
  repo: Repository<T>,
  items: object[],
  label: string,
): Promise<void> {
  await repo.upsert(items as T[], {
    conflictPaths: ['name'],
    skipUpdateIfNoValuesChanged: true,
  })
  console.log(`✅  ${label}`)
}

async function main(): Promise<void> {
  await dataSource.initialize()
  console.log('🔌 Conectado ao banco\n')

  try {
    await upsertByName(dataSource.getRepository(Role), roles, 'roles')
    await upsertByName(
      dataSource.getRepository(TenantStatus),
      tenantStatuses,
      'tenant_statuses',
    )
    await upsertByName(
      dataSource.getRepository(SubscriptionStatus),
      subscriptionStatuses,
      'subscription_statuses',
    )
    await upsertByName(
      dataSource.getRepository(InvoiceStatus),
      invoiceStatuses,
      'invoice_statuses',
    )
    await upsertByName(
      dataSource.getRepository(NotificationType),
      notificationTypes,
      'notification_types',
    )
    await upsertByName(
      dataSource.getRepository(PlanType),
      planTypes,
      'plan_types',
    )

    // plans precisam do typeId: busca MONTHLY após upsert acima
    const monthlyType = await dataSource
      .getRepository(PlanType)
      .findOneByOrFail({ name: 'MONTHLY' })
    const plansWithType = plans.map((p) => ({ ...p, typeId: monthlyType.id }))
    await dataSource.getRepository(Plan).upsert(plansWithType, {
      conflictPaths: ['name'],
      skipUpdateIfNoValuesChanged: true,
    })
    console.log('✅  plans')

    console.log('\n🌱 Seed concluído com sucesso!')
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    process.exit(1)
  } finally {
    await dataSource.destroy()
    console.log('👋 Conexão encerrada')
  }
}

main()
