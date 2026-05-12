import { Exists } from '@shared/types/base-repository/exists.type'
import { FindByField } from '@shared/types/base-repository/find-by-field.type'
import { FindManyPaginated } from '@shared/types/base-repository/find-many-paginated.type'
import { FindMany } from '@shared/types/base-repository/find-many.type'
import { Insert } from '@shared/types/base-repository/insert.type'
import { UpdateItem } from '@shared/types/base-repository/update-item.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

export interface IBaseRepository {
  findAll<R>(params?: FindMany): Promise<R[]>
  findAllPaginated<R>(params: FindManyPaginated): Promise<PaginatedResponse<R>>
  findItem<R>(params: FindByField): Promise<R>
  exists(params: Exists): Promise<boolean>
  insert<T, R>(params: Insert<T>): Promise<R>
  updateItem<DT, R>(params: UpdateItem<DT>): Promise<R>
  softDelete(id: string): Promise<{ message: string }>
  deleteMany(where: Record<string, unknown>): Promise<void> 
}
