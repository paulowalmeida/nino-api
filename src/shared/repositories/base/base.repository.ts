import { Injectable, NotFoundException } from '@nestjs/common'

import { IBaseModel } from '@shared/interfaces/base-model.interface'
import { IBaseRepository } from '@shared/interfaces/base-repository.interface'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { FilterExists } from '@shared/types/base-repository/exists.type'
import { FindByField } from '@shared/types/base-repository/find-by-field.type'
import { FindManyPaginated } from '@shared/types/base-repository/find-many-paginated.type'
import { FindMany } from '@shared/types/base-repository/find-many.type'
import { Insert } from '@shared/types/base-repository/insert.type'
import { UpdateItem } from '@shared/types/base-repository/update-item.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

/**
 * Abstract base for all domain repositories. Wraps Prisma operations,
 * centralizes error handling via ErrorService, and applies soft-delete
 * filters automatically. Domain services call these primitives directly.
 *
 * `Model` must be a Prisma delegate — the property on PrismaService that
 * matches the model name (e.g. `Prisma.PlanDelegate` → `prisma.plan`).
 */
@Injectable()
export abstract class BaseRepository<
  Model extends IBaseModel,
> implements IBaseRepository {
  constructor(
    protected readonly errorService: ErrorService,
    private readonly model: Model,
    private readonly entityName: string = 'Record',
    protected readonly paginationService?: PaginationService,
  ) {}

  /**
   * Returns all non-deleted records. Applies `deletedAt: null` unless `ignoreDeleted` is set.
   * @typeParam Entity - Entity or response type expected from Prisma.
   * @param params - Optional filters, ordering, includes, and `ignoreDeleted` flag.
   * @returns Array of `Entity`.
   */
  async findAll<Entity>(params?: FindMany): Promise<Entity[]> {
    const resolvedWhere = this.buildWhere(
      params?.where ?? {},
      params?.ignoreDeleted ?? false,
    )
    return this.executeFnWithTryCatch(() =>
      this.model.findMany({
        where: resolvedWhere,
        orderBy: params?.order
          ? { [params.order.target]: params.order.direction }
          : undefined,
        include: params?.include,
      }),
    )
  }

  /**
   * Returns paginated records. Requires PaginationService in the constructor.
   * @typeParam Entity - Entity or response type expected from Prisma.
   * @param params - Pagination (`page`, `size`), optional filters, ordering, and includes.
   * @returns `PaginatedResponse<Entity>` with data, total, page, and size.
   */
  async findAllPaginated<Entity>(
    params: FindManyPaginated,
  ): Promise<PaginatedResponse<Entity>> {
    if (!this.paginationService) {
      throw new Error('PaginationService not provided')
    }

    const resolvedWhere = this.buildWhere(
      params.where ?? {},
      params.ignoreDeleted ?? false,
    )

    return this.executeFnWithTryCatch(() =>
      this.handlePagination<Entity>(
        resolvedWhere,
        params.order
          ? { [params.order.target]: params.order.direction }
          : undefined,
        params.include,
        params.page ?? 1,
        params.size ?? 10,
      ),
    )
  }

  /**
   * Finds a single record by arbitrary where clause. Throws `NotFoundException` if not found.
   * @typeParam Entity - Entity or response type expected from Prisma.
   * @param params - Where clause, optional include, and `ignoreDeleted` flag.
   * @returns The matching record typed as `Entity`.
   */
  async findItem<Entity>(params: FindByField): Promise<Entity> {
    const resolvedWhere = this.buildWhere(
      params.where ?? {},
      params.ignoreDeleted ?? false,
    )
    return this.executeFnWithTryCatch(async () =>
      this.assertFound<Entity>(
        await this.model.findFirst({
          where: resolvedWhere,
          include: params.include,
        }),
      ),
    )
  }

  /**
   * Returns true if at least one record matches the where clause.
   * @param params - Where clause and optional `ignoreDeleted` flag.
   * @returns `true` if a matching record exists, `false` otherwise.
   */
  async exists(params: FilterExists): Promise<boolean> {
    const resolvedWhere = this.buildWhere(
      params.where,
      params.ignoreDeleted ?? false,
    )
    return this.executeFnWithTryCatch(async () => {
      const found = await this.model.findFirst({ where: resolvedWhere })
      return !!found
    })
  }

  /**
   * Creates a new record. Accepts the full Prisma create query (data, include, etc.).
   * @typeParam CreateDto - DTO shape going in.
   * @typeParam Entity    - Entity or response type coming out.
   * @param params - Full Prisma create query (`data`, optional `include`).
   * @returns The created record typed as `Entity`.
   */
  async insert<CreateDto, Entity>(params: Insert<CreateDto>): Promise<Entity> {
    return this.executeFnWithTryCatch(() => this.model.create(params))
  }

  /**
   * Updates a record by arbitrary where clause. Prisma throws P2025 if not found → `NotFoundException`.
   * @typeParam UpdateDto - Partial update shape going in.
   * @typeParam Entity    - Entity or response type coming out.
   * @param params - Where clause, update data, and optional include.
   * @returns The updated record typed as `Entity`.
   */
  async updateItem<UpdateDto, Entity>(
    params: UpdateItem<UpdateDto>,
  ): Promise<Entity> {
    return this.executeFnWithTryCatch(() =>
      this.model.update({
        where: params.where,
        data: params.data,
        include: params.include,
      }),
    )
  }

  /**
   * Hard-deletes all records matching the where clause. Use with caution.
   * @param where - Prisma where filter to select records for deletion.
   * @returns `void`.
   */
  async deleteMany(where: Record<string, unknown>): Promise<void> {
    await this.executeFnWithTryCatch(() => this.model.deleteMany({ where }))
  }

  /**
   * Sets `deletedAt` to now. Validates existence internally via P2025 → `NotFoundException`.
   * @param where - Prisma where clause identifying the record to soft-delete.
   * @returns `{ message: string }` confirmation.
   */
  async softDelete(
    where: Record<string, unknown>,
  ): Promise<{ message: string }> {
    return this.executeFnWithTryCatch(async () => {
      await this.model.update({
        where,
        data: { deletedAt: new Date() },
      })
      return { message: 'Deleted successfully' }
    })
  }

  /** Throws NotFoundException if found is null. Used internally by findItem. */
  private assertFound<Entity>(found: Entity | null): Entity {
    if (!found) throw new NotFoundException(`${this.entityName} not found`)
    return found
  }

  /** Merges custom where with `deletedAt: null` unless ignoreDeleted is true. */
  private buildWhere(
    where: Record<string, unknown>,
    ignoreDeleted: boolean,
  ): Record<string, unknown> {
    return { ...where, ...(ignoreDeleted ? {} : { deletedAt: null }) }
  }

  /** Wraps any async operation with ErrorService error handling. */
  private async executeFnWithTryCatch<Result>(
    fn: () => Promise<Result>,
  ): Promise<Result> {
    try {
      return await fn()
    } catch (error) {
      return this.errorService.handle(error)
    }
  }

  /** Runs count + findMany in parallel and delegates pagination math to PaginationService. */
  private async handlePagination<Entity>(
    where: Record<string, unknown>,
    orderBy: Record<string, unknown> | undefined,
    include: Record<string, unknown> | undefined,
    page: number,
    size: number,
  ): Promise<PaginatedResponse<Entity>> {
    const { skip, take } = this.paginationService!.getPaginationParams({
      page,
      size,
    })
    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        include,
        skip,
        take,
      }),
      this.model.count({ where }),
    ])
    return this.paginationService!.paginate<Entity>(data, total, { page, size })
  }
}
