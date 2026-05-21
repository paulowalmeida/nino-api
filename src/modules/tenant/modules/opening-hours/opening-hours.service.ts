import { Injectable } from '@nestjs/common'

import { OpeningHours } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CreateOpeningHoursDto } from './dtos/create-opening-hours.dto'
import { UpdateOpeningHoursDto } from './dtos/update-opening-hours.dto'
import { OpeningHoursRepository } from './opening-hours.repository'
import { OpeningHoursPaginatedResponse } from './types/opening-hours-paginated-response.type'

@Injectable()
export class OpeningHoursService {
  constructor(private readonly repo: OpeningHoursRepository) {}

  async getAll(
    tenantId: string,
    query: PaginatedQueryDto,
  ): Promise<OpeningHoursPaginatedResponse> {
    return this.repo.findAllPaginated<OpeningHours>({
      where: { tenantId },
      order: {
        target: query.target ?? 'dayOfWeek',
        direction: query.direction ?? 'asc',
      },
      page: query.page,
      size: query.size,
    })
  }

  async getById(id: string): Promise<OpeningHours> {
    return this.repo.findItem<OpeningHours>({ where: { id } })
  }

  async create(data: CreateOpeningHoursDto): Promise<OpeningHours> {
    return this.repo.insert<CreateOpeningHoursDto, OpeningHours>({ data })
  }

  async update(id: string, data: UpdateOpeningHoursDto): Promise<OpeningHours> {
    return this.repo.updateItem<UpdateOpeningHoursDto, OpeningHours>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
