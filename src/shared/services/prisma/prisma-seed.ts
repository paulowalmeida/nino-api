import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import * as dotenv from 'dotenv'
import { Pool } from 'pg'

import {
  notificationTypes,
  plans,
  roles,
  subscriptionStatuses,
} from './prisma-seed.data'

dotenv.config()

// 1. Cria a conexão bruta com o Postgres usando o driver 'pg'
const pool = new Pool({ connectionString: process.env.DB_URL })
const adapter = new PrismaPg(pool)

// 2. No Prisma 7, o 'adapter' é a propriedade correta no construtor
const prisma = new PrismaClient({ adapter })

async function disconnect() {
  await prisma?.$disconnect()
  console.log('Database connection closed. 👋')
}

async function seed(items: any[], tableName: string) {
  try {
    const keys = Object.keys(items[0])
    for (const item of items) {
      const data = Object.fromEntries(keys.map((k) => [k, item[k]]))
      await prisma[tableName].upsert({
        where: { id: item.id },
        update: data,
        create: data,
      })
    }
    console.log(`Initial populate of the ${tableName} successful! ✅`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

async function main() {
  try {
    await seed(roles, 'role')
    await seed(plans, 'plan')
    await seed(subscriptionStatuses, 'subscriptionStatus')
    await seed(notificationTypes, 'notificationType')
  } finally {
    await disconnect()
  }
}

main()
