import { OrderCreateData } from './order-create-data.type'

export type OrderItemData = {
  productId: string
  quantity: number
  unitPrice: number
}

export type OrderWithItemsData = {
  order: OrderCreateData
  items: OrderItemData[]
}
