import { Injectable } from '@nestjs/common'

import { FindManyPaginated } from '@shared/types/base-repository/find-many-paginated.type'
import { Order } from '@shared/types/base-repository/order.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CommonRepository } from './common.repository'
import { CreateCommonDto } from './dtos/create-common.dto'
import { UpdateCommonDto } from './dtos/update-common.dto'
import { CommonEntity } from './types/common-entity.type'

@Injectable()
export class CommonService {
  constructor(private readonly repo: CommonRepository) {}

  async getAll(order?: Order): Promise<CommonEntity[]> {
    return this.repo.findAll<CommonEntity>({ order })
  }

  async getAllPaginated(
    params?: FindManyPaginated,
  ): Promise<PaginatedResponse<CommonEntity>> {
    return this.repo.findAllPaginated<CommonEntity>(params ?? {})
  }

  async getByField(field: string, value: string): Promise<CommonEntity> {
    return this.repo.findItem<CommonEntity>({ where: { [field]: value } })
  }

  async create(data: CreateCommonDto): Promise<CommonEntity> {
    return this.repo.insert<CreateCommonDto, CommonEntity>({ data })
  }

  async update(id: string, data: UpdateCommonDto): Promise<CommonEntity> {
    return this.repo.updateItem<UpdateCommonDto, CommonEntity>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
