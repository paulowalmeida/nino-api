import { Exists } from '@shared/types/base-repository/exists.type'
import { FindByField } from '@shared/types/base-repository/find-by-field.type'
import { FindManyPaginated } from '@shared/types/base-repository/find-many-paginated.type'
import { FindMany } from '@shared/types/base-repository/find-many.type'
import { Insert } from '@shared/types/base-repository/insert.type'
import { UpdateItem } from '@shared/types/base-repository/update-item.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

/**
 * Low-level infrastructure contract implemented by `BaseRepository`.
 * Exposes Prisma-style primitives used internally by domain repositories.
 * Domain layers (services, controllers) must NOT depend on this —
 * depend on `IBaseLookupRepository` or domain-specific interfaces instead.
 *
 * Method generics:
 * - `Entity`    — entity or response type for read/write operations.
 * - `CreateDto` — input DTO for `insert`.
 * - `UpdateDto` — partial update DTO for `updateItem`.
 */
export interface IBaseRepository {
  findAll<Entity>(params?: FindMany): Promise<Entity[]>
  findAllPaginated<Entity>(
    params: FindManyPaginated,
  ): Promise<PaginatedResponse<Entity>>
  findItem<Entity>(params: FindByField): Promise<Entity>
  exists(params: Exists): Promise<boolean>
  insert<CreateDto, Entity>(params: Insert<CreateDto>): Promise<Entity>
  updateItem<UpdateDto, Entity>(params: UpdateItem<UpdateDto>): Promise<Entity>
  softDelete(id: string): Promise<{ message: string }>
  deleteMany(where: Record<string, unknown>): Promise<void>
}
