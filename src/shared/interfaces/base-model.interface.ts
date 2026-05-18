/**
 * Minimum contract a Prisma delegate must satisfy to be accepted by
 * `BaseRepository`. Each property matches a method on the generated
 * Prisma delegate (e.g. `prisma.user`, `prisma.plan`).
 *
 * `any` is intentional here: Prisma delegates are structurally typed
 * with deeply generic args. Narrowing them here would require re-declaring
 * Prisma's entire input/output types — the real constraint lives in the
 * consuming repository via `extends BaseRepository<Prisma.XDelegate>`.
 */
export interface IBaseModel {
  findMany: (args?: any) => Promise<any>
  findFirst: (args?: any) => Promise<any>
  create: (args?: any) => Promise<any>
  update: (args?: any) => Promise<any>
  count: (args?: any) => Promise<any>
  deleteMany: (args?: any) => Promise<any>
}
