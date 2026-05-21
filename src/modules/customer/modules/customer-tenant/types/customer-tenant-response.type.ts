import { CustomerTenantFull } from './customer-tenant-full.type'

export type CustomerTenantResponse = Omit<
  CustomerTenantFull,
  'customerId' | 'tenantId'
>
