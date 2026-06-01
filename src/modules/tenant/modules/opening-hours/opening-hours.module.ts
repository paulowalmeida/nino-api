import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { OpeningHoursController } from './opening-hours.controller'
import { OpeningHoursRepository } from './opening-hours.repository'
import { OpeningHoursService } from './opening-hours.service'

@Module({
  controllers: [OpeningHoursController],
  providers: [OpeningHoursService, OpeningHoursRepository, ErrorService, PaginationService],
  exports: [OpeningHoursService],
})
export class OpeningHoursModule {}
