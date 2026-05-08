import { Injectable, NotFoundException } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'

@Injectable()
export abstract class BaseRepository {
  constructor(protected readonly errorService: ErrorService) {}

  protected async executeFnWithTryCatch<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  protected async findMany<Return>(
    model: { findMany: (args?: any) => Promise<Return> },
    includeDeleted = false,
    orderBy?: Record<string, 'asc' | 'desc'>,
  ): Promise<Return> {
    const where = includeDeleted ? {} : { deletedAt: null }
    return this.executeFnWithTryCatch(() => model.findMany({ where, orderBy }))
  }

  protected async getFirst<Return, Value>(
    model: { findFirst: (args?: any) => Promise<Return | null> },
    key: string,
    value: Value,
    includeDeleted = false,
  ): Promise<Return> {
    const where = includeDeleted
      ? { [key]: value }
      : { [key]: value, deletedAt: null }
    return this.executeFnWithTryCatch(async () => {
      const found = await model.findFirst({ where })
      if (!found) throw new NotFoundException('Not found')
      return found
    })
  }

  protected async insert<Data, Return>(
    model: { create: ({ data }: { data: Data }) => Promise<Return> },
    data: Data,
  ): Promise<Return> {
    return this.executeFnWithTryCatch(() => model.create({ data }))
  }

  protected async softDelete(
    model: { update: (args?: any) => Promise<any> },
    id: string,
  ): Promise<{ message: string }> {
    return this.executeFnWithTryCatch(async () => {
      await model.update({ where: { id }, data: { deletedAt: new Date() } })
      return { message: 'Deleted successfully' }
    })
  }
}
