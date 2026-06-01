import { OrderFull } from './order-full.type'

export type OrderResponse = Omit<OrderFull, 'statusId'>
