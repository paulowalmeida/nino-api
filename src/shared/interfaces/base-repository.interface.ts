import { FilterExists } from '@shared/types/base-repository/exists.type'
import { FindByField } from '@shared/types/base-repository/find-by-field.type'
import { FindManyPaginated } from '@shared/types/base-repository/find-many-paginated.type'
import { FindMany } from '@shared/types/base-repository/find-many.type'
import { Insert } from '@shared/types/base-repository/insert.type'
import { UpdateItem } from '@shared/types/base-repository/update-item.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'


export interface IBaseRepository {
  findAll<Entity>(params?: FindMany): Promise<Entity[]>
  findAllPaginated<Entity>(
    params: FindManyPaginated,
  ): Promise<PaginatedResponse<Entity>>
  findItem<Entity>(params: FindByField): Promise<Entity>
  exists(params: FilterExists): Promise<boolean>
  insert<CreateDto, Entity>(params: Insert<CreateDto>): Promise<Entity>
  updateItem<UpdateDto, Entity>(params: UpdateItem<UpdateDto>): Promise<Entity>
  softDelete(where: Record<string, unknown>): Promise<{ message: string }>
  deleteMany(where: Record<string, unknown>): Promise<void>
}
