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
import { Order } from '@shared/types/base-repository/order.type'
import { UpdateItem } from '@shared/types/base-repository/update-item.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

export const SOFT_DELETE_MESSAGE = 'Deleted successfully'

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

  async findAll<Entity>(params?: FindMany): Promise<Entity[]> {
    const resolvedWhere = this.buildWhere(params?.where, params?.ignoreDeleted)
    return this.executeFnWithTryCatch(() =>
      this.model.findMany({
        where: resolvedWhere,
        orderBy: this.buildOrderBy(params?.order),
        include: params?.include,
      }),
    )
  }

  async findAllPaginated<Entity>(
    params: FindManyPaginated,
  ): Promise<PaginatedResponse<Entity>> {
    if (!this.paginationService) {
      throw new Error('PaginationService not provided')
    }
    const pagination = this.paginationService
    const resolvedWhere = this.buildWhere(params.where, params.ignoreDeleted)
    const orderBy = this.buildOrderBy(params.order)
    const page = params.page ?? 1
    const size = params.size ?? 10
    return this.executeFnWithTryCatch(async () => {
      const { skip, take } = pagination.getPaginationParams({ page, size })
      const [data, total] = await Promise.all([
        this.model.findMany({ where: resolvedWhere, orderBy, include: params.include, skip, take }),
        this.model.count({ where: resolvedWhere }),
      ])
      return pagination.paginate<Entity>(data, total, { page, size })
    })
  }

  async findItem<Entity>(params: FindByField): Promise<Entity> {
    const resolvedWhere = this.buildWhere(params.where, params.ignoreDeleted)
    return this.executeFnWithTryCatch(async () =>
      this.assertFound<Entity>(
        await this.model.findFirst({
          where: resolvedWhere,
          include: params.include,
        }),
      ),
    )
  }

  async exists(params: FilterExists): Promise<boolean> {
    const resolvedWhere = this.buildWhere(params.where, params.ignoreDeleted)
    return this.executeFnWithTryCatch(() =>
      this.model.count({ where: resolvedWhere }).then((n: number) => n > 0),
    )
  }

  async insert<CreateDto, Entity>(params: Insert<CreateDto>): Promise<Entity> {
    return this.executeFnWithTryCatch(() => this.model.create(params))
  }

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

  async deleteMany(where: Record<string, unknown>): Promise<void> {
    await this.executeFnWithTryCatch(() => this.model.deleteMany({ where }))
  }

  async softDelete(
    where: Record<string, unknown>,
  ): Promise<{ message: string }> {
    return this.executeFnWithTryCatch(() =>
      this.model
        .update({ where, data: { deletedAt: new Date() } })
        .then(() => ({ message: SOFT_DELETE_MESSAGE })),
    )
  }

  /** Throws NotFoundException if found is null. Used internally by findItem. */
  private assertFound<Entity>(found: Entity | null): Entity {
    if (!found) throw new NotFoundException(`${this.entityName} not found`)
    return found
  }

  /** Merges custom where with `deletedAt: null` unless ignoreDeleted is true. */
  private buildWhere(
    where?: Record<string, unknown>,
    ignoreDeleted?: boolean,
  ): Record<string, unknown> {
    return { ...(where ?? {}), ...(ignoreDeleted ? {} : { deletedAt: null }) }
  }

  /** Converts order param to Prisma `orderBy` shape. */
  private buildOrderBy(order?: Order): Record<string, string> | undefined {
    return order ? { [order.target]: order.direction } : undefined
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
}
