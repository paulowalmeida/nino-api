import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    // 1. Forçamos a captura da URL como String
    const url = configService.get<string>('DB_URL');

    if (!url) {
      throw new Error('DB_URL não encontrada no .env');
    }

    // 2. Criamos o pool. O erro 'must be a string' morre aqui 
    // porque garantimos que 'url' é uma string válida.
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);

    // 3. Inicializamos o Prisma com o adapter
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}