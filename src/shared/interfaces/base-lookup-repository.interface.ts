/**
 * Domain-level contract for repositories with standard CRUD operations.
 * Implemented by every domain repository. `BaseService` depends on this
 * interface — never on `IBaseRepository` or Prisma directly — so swapping
 * the ORM only requires updating the repository, not the service or controller.
 *
 * Requires class-level generics (not method-level) because domain repositories
 * implement it with concrete types, and TypeScript only accepts concrete methods
 * satisfying concrete interface signatures — not generic ones.
 *
 * @typeParam Entity         - Domain entity returned by read/write operations.
 * @typeParam CreateDto      - Input DTO for `create`.
 * @typeParam UpdateDto      - Partial update DTO for `update`.
 * @typeParam QueryParamsDto - Optional query/filter params for `getAll`. Defaults to `undefined`.
 * @typeParam GetAllResponse - Return type of `getAll`. Defaults to `Entity[]`
 *                            (override with `PaginatedResponse<Entity>` when paginated).
 */
export interface IBaseLookupRepository<
  Entity,
  CreateDto,
  UpdateDto,
  QueryParamsDto = undefined,
  GetAllResponse = Entity[],
> {
  getAll(params?: QueryParamsDto): Promise<GetAllResponse>
  getById(id: string): Promise<Entity>
  create(data: CreateDto): Promise<Entity>
  update(id: string, data: UpdateDto): Promise<Entity>
  delete(id: string): Promise<{ message: string }>
}
