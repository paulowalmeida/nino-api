import { Order } from './order.type'

export type FindMany = {
  where?: Record<string, unknown>
  ignoreDeleted?: boolean
  order?: Order
  include?: Record<string, unknown>
}
