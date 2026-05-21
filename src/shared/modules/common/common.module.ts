import { DynamicModule, Module } from '@nestjs/common'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { CommonRepository } from './common.repository'
import { CommonService } from './common.service'

@Module({})
export class CommonModule {
  static forFeature(modelKey: string, entityName: string): DynamicModule {
    return {
      module: CommonModule,
      providers: [
        {
          provide: CommonRepository,
          useFactory: (
            prisma: PrismaService,
            error: ErrorService,
            pagination: PaginationService,
          ) =>
            new CommonRepository(
              error,
              prisma[modelKey],
              entityName,
              pagination,
            ),
          inject: [PrismaService, ErrorService, PaginationService],
        },
        CommonService,
        ErrorService,
        PaginationService,
      ],
      exports: [CommonService],
    }
  }
}
