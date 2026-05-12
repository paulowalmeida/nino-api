 export type FindByField = {
    where: Record<string, unknown>
    ignoreDeleted?: boolean
    include?: Record<string, unknown>
  }