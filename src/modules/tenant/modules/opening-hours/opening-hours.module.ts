import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { OpeningHoursController } from './opening-hours.controller'
import { OpeningHoursRepository } from './opening-hours.repository'
import { OpeningHoursService } from './opening-hours.service'

@Module({
  controllers: [OpeningHoursController],
  providers: [OpeningHoursService, OpeningHoursRepository, ErrorService],
  exports: [OpeningHoursService],
})
export class OpeningHoursModule {}
