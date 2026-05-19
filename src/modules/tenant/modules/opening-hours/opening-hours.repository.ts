import { Injectable } from '@nestjs/common'

import { OpeningHours, Prisma } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateOpeningHoursDto } from './dtos/create-opening-hours.dto'
import { UpdateOpeningHoursDto } from './dtos/update-opening-hours.dto'

@Injectable()
export class OpeningHoursRepository
  extends BaseRepository<Prisma.OpeningHoursDelegate>
  implements IBaseLookupRepository<
    OpeningHours,
    CreateOpeningHoursDto,
    UpdateOpeningHoursDto,
    string
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.openingHours, 'Opening Hours')
  }

  async getAll(tenantId?: string): Promise<OpeningHours[]> {
    return this.findAll<OpeningHours>({
      where: { tenantId },
      orderBy: { dayOfWeek: 'asc' },
    })
  }

  async getById(id: string): Promise<OpeningHours> {
    return this.findItem<OpeningHours>({ where: { id } })
  }

  async create(data: CreateOpeningHoursDto): Promise<OpeningHours> {
    return this.insert<CreateOpeningHoursDto, OpeningHours>({ data })
  }

  async update(
    id: string,
    data: UpdateOpeningHoursDto,
  ): Promise<OpeningHours> {
    return this.updateItem<UpdateOpeningHoursDto, OpeningHours>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
