import * as dotenv from 'dotenv'
import 'reflect-metadata'
dotenv.config()

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

import {
  businessCategories,
  globalRoles,
  invoiceStatuses,
  notificationTypes,
  orderStatuses,
  paymentMethods,
  paymentStatuses,
  planTypes,
  plans,
  subscriptionStatuses,
  tenantRoles,
  tenantStatuses,
  tenantTypes,
} from './seed.data'

const pool = new Pool({ connectionString: process.env.DB_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔌 Conectado ao banco\n')

  for (const role of globalRoles) {
    await prisma.globalRole.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }
  console.log('✅  global_roles')

  for (const role of tenantRoles) {
    await prisma.tenantRole.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    })
  }
  console.log('✅  tenant_roles')

  for (const ts of tenantStatuses) {
    await prisma.tenantStatus.upsert({
      where: { name: ts.name },
      update: {},
      create: ts,
    })
  }
  console.log('✅  tenant_statuses')

  for (const ss of subscriptionStatuses) {
    await prisma.subscriptionStatus.upsert({
      where: { name: ss.name },
      update: {},
      create: ss,
    })
  }
  console.log('✅  subscription_statuses')

  for (const is of invoiceStatuses) {
    await prisma.invoiceStatus.upsert({
      where: { name: is.name },
      update: {},
      create: is,
    })
  }
  console.log('✅  invoice_statuses')

  for (const nt of notificationTypes) {
    await prisma.notificationType.upsert({
      where: { name: nt.name },
      update: {},
      create: nt,
    })
  }
  console.log('✅  notification_types')

  for (const pt of planTypes) {
    await prisma.planType.upsert({
      where: { name: pt.name },
      update: {},
      create: pt,
    })
  }
  console.log('✅  plan_types')

  const monthlyType = await prisma.planType.findUniqueOrThrow({
    where: { name: 'MONTHLY' },
  })
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: { ...plan, typeId: monthlyType.id },
    })
  }
  console.log('✅  plans')

  for (const bc of businessCategories) {
    await prisma.businessCategory.upsert({
      where: { name: bc.name },
      update: {},
      create: bc,
    })
  }
  console.log('✅  business_categories')

  for (const tt of tenantTypes) {
    await prisma.tenantType.upsert({
      where: { name: tt.name },
      update: {},
      create: tt,
    })
  }
  console.log('✅  tenant_types')

  for (const os of orderStatuses) {
    await prisma.orderStatus.upsert({
      where: { name: os.name },
      update: {},
      create: os,
    })
  }
  console.log('✅  order_statuses')

  for (const ps of paymentStatuses) {
    await prisma.paymentStatus.upsert({
      where: { name: ps.name },
      update: {},
      create: ps,
    })
  }
  console.log('✅  payment_statuses')

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: pm.name },
      update: {},
      create: pm,
    })
  }
  console.log('✅  payment_methods')

  console.log('\n🌱 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
