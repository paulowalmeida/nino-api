import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class OpeningHoursRepository extends BaseRepository<Prisma.OpeningHoursDelegate> {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.openingHours, 'Opening Hours')
  }
}
