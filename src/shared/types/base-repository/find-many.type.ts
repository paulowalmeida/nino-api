export type FindMany = {
  where?: Record<string, unknown>
  ignoreDeleted?: boolean
  orderBy?: Record<string, unknown>
  include?: Record<string, unknown>
}
