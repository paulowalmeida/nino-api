
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

import { UserRole } from '@shared/enums/user-role.enum';

dotenv.config();

// 1. Cria a conexão bruta com o Postgres usando o driver 'pg'
const pool = new Pool({ connectionString: process.env.DB_URL });
const adapter = new PrismaPg(pool);

// 2. No Prisma 7, o 'adapter' é a propriedade correta no construtor
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    { code: UserRole.UNRECOGNIZED, description: 'UNRECOGNIZED' },
    { code: UserRole.UNSPECIFIED, description: 'USER_ROLE_UNSPECIFIED' },
    { code: UserRole.ADMIN, description: 'ADMIN' },
    { code: UserRole.SUPPORT, description: 'SUPPORT' },
    { code: UserRole.MERCHANT, description: 'MERCHANT' },
    { code: UserRole.CUSTOMER, description: 'CUSTOMER' },
    { code: UserRole.COURIER, description: 'COURIER' },
    { code: UserRole.GUEST, description: 'GUEST' },
  ];

  console.log('Seed: Populando UserRoles...');

  for (const role of roles) {
    await prisma.userRole.upsert({
      where: { code: role.code },
      update: { description: role.description },
      create: {
        code: role.code,
        description: role.description,
      }
    });
  }

}

main()
  .then(async () => {
    console.log('Seed finalizado com sucesso! ✅');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Conexão com o banco de dados encerrada. 👋');
  });