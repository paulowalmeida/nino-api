import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { CustomerOwnerGuard } from '../../guards/customer-owner.guard'
import { LoyaltyTransactionController } from './loyalty-transaction.controller'
import { LoyaltyTransactionRepository } from './loyalty-transaction.repository'
import { LoyaltyTransactionService } from './loyalty-transaction.service'

@Module({
  controllers: [LoyaltyTransactionController],
  providers: [
    LoyaltyTransactionService,
    LoyaltyTransactionRepository,
    CustomerOwnerGuard,
    ErrorService,
    PaginationService,
  ],
  exports: [LoyaltyTransactionService],
})
export class LoyaltyTransactionModule {}
