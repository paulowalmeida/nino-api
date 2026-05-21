export type OrderCreateData = {
  tenantId: string
  statusId: string
  customerId?: string
  deliveryAddressId?: string
  isDelivery: boolean
  deliveryFee: number
  subtotal: number
  totalAmount: number
  notes?: string
  estimatedDeliveryAt?: Date
  loyaltyPointsUsed?: number
  loyaltyDiscount?: number
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  guestCpf?: string
  guestZipCode?: string
  guestStreet?: string
  guestNumber?: string
  guestComplement?: string
  guestNeighborhood?: string
  guestCity?: string
  guestState?: string
}
