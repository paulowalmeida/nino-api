import { FindMany } from './find-many.type'

export type FindManyPaginated = FindMany & {
  page?: number
  size?: number
}
