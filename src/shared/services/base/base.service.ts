import { Injectable } from '@nestjs/common'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'

/**
 * Abstract base for all domain services. Delegates CRUD operations to the
 * repository and exposes them under a stable contract (`IBaseService`).
 *
 * Domain services that need no extra logic can extend this class directly.
 * Services that need custom logic override individual methods and call
 * `super.method()` when the base behaviour still applies.
 *
 * @typeParam Entity         - The domain entity returned by read operations.
 * @typeParam CreateDto      - DTO accepted by `create`.
 * @typeParam UpdateDto      - DTO accepted by `update`.
 * @typeParam ParamsDto      - Optional query params accepted by `getAll`.
 * @typeParam GetAllResponse - Return type of `getAll`. Defaults to `Entity[]`.
 */
@Injectable()
export abstract class BaseService<
  Entity,
  CreateDto,
  UpdateDto,
  ParamsDto = undefined,
  GetAllResponse = Entity[],
> {
  constructor(
    private readonly repository: IBaseLookupRepository<
      Entity,
      CreateDto,
      UpdateDto,
      ParamsDto,
      GetAllResponse
    >,
  ) {}

  async getAll(params?: ParamsDto): Promise<GetAllResponse> {
    return this.repository.getAll(params)
  }

  async getById(id: string): Promise<Entity> {
    return this.repository.getById(id)
  }

  async create(data: CreateDto): Promise<Entity> {
    return this.repository.create(data)
  }

  async update(id: string, data: UpdateDto): Promise<Entity> {
    return this.repository.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repository.delete(id)
  }
}
