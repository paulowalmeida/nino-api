import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PrismaErrorService } from './prisma-error.service'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, PrismaErrorService],
  exports: [PrismaService, PrismaErrorService],
})
export class PrismaModule {}
