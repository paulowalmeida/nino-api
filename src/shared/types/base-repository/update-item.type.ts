export type UpdateItem<DT> = {
  where: Record<string, unknown>
  data: DT
  include?: Record<string, unknown>
}
