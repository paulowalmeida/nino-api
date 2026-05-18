export type UpdateItem<DataType> = {
  where: Record<string, unknown>
  data: DataType
  include?: Record<string, unknown>
}
