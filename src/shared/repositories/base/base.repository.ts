import { Injectable, NotFoundException } from '@nestjs/common'

import { BasePrismaDelegate } from '@shared/interfaces/base-delegate.interface'
import { IBaseRepository } from '@shared/interfaces/base-repository.interface'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { Exists } from '@shared/types/base-repository/exists.type'
import { FindByField } from '@shared/types/base-repository/find-by-field.type'
import { FindManyPaginated } from '@shared/types/base-repository/find-many-paginated.type'
import { FindMany } from '@shared/types/base-repository/find-many.type'
import { Insert } from '@shared/types/base-repository/insert.type'
import { UpdateItem } from '@shared/types/base-repository/update-item.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

@Injectable()
export abstract class BaseRepository<
  MT extends BasePrismaDelegate,
> implements IBaseRepository {
  constructor(
    protected readonly errorService: ErrorService,
    private readonly model: MT,
    private readonly entityName: string = 'Record',
    protected readonly paginationService?: PaginationService,
  ) {}

  async findAll<R>(params?: FindMany): Promise<R[]> {
    const resolvedWhere = this.buildWhere(
      params?.where ?? {},
      params?.ignoreDeleted ?? false,
    )
    return this.executeFnWithTryCatch(() =>
      this.model.findMany({
        where: resolvedWhere,
        orderBy: params?.orderBy,
        include: params?.include,
      }),
    )
  }

  async findAllPaginated<R>(
    params: FindManyPaginated,
  ): Promise<PaginatedResponse<R>> {
    if (!this.paginationService) {
      throw new Error('PaginationService not provided')
    }

    const resolvedWhere = this.buildWhere(
      params.where ?? {},
      params.ignoreDeleted ?? false,
    )

    return this.executeFnWithTryCatch(() =>
      this.handlePagination<R>(
        resolvedWhere,
        params.orderBy,
        params.include,
        params.page,
        params.size,
      ),
    )
  }

  async findItem<R>(params: FindByField): Promise<R> {
    const resolvedWhere = this.buildWhere(
      params.where ?? {},
      params.ignoreDeleted ?? false,
    )
    return this.executeFnWithTryCatch(async () =>
      this.assertFound<R>(
        await this.model.findFirst({
          where: resolvedWhere,
          include: params.include,
        }),
      ),
    )
  }

  async exists(params: Exists): Promise<boolean> {
    const resolvedWhere = this.buildWhere(
      params.where,
      params.ignoreDeleted ?? false,
    )
    return this.executeFnWithTryCatch(async () => {
      const found = await this.model.findFirst({ where: resolvedWhere })
      return !!found
    })
  }

  async insert<T, R>(params: Insert<T>): Promise<R> {
    return this.executeFnWithTryCatch(() => this.model.create(params)) as R
  }

  async updateItem<DT, R>(params: UpdateItem<DT>): Promise<R> {
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

  async softDelete(id: string): Promise<{ message: string }> {
    return this.executeFnWithTryCatch(async () => {
      await this.model.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Deleted successfully' }
    })
  }

  private assertFound<R>(found: R | null): R {
    if (!found) throw new NotFoundException(`${this.entityName} not found`)
    return found
  }

  private buildWhere(
    where: Record<string, unknown>,
    ignoreDeleted: boolean,
  ): Record<string, unknown> {
    return { ...where, ...(ignoreDeleted ? {} : { deletedAt: null }) }
  }

  private async executeFnWithTryCatch<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  private async handlePagination<R>(
    where: Record<string, unknown>,
    orderBy: Record<string, unknown> | undefined,
    include: Record<string, unknown> | undefined,
    page: number,
    size: number,
  ): Promise<PaginatedResponse<R>> {
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
    return this.paginationService!.paginate(data, total, { page, size })
  }
}
