export type Insert<T> = {
  data: T
  include?: Record<string, unknown>
  select?: Record<string, unknown>
}
