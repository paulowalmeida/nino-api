import { Company, Tenant, TenantStatus, TenantType } from '@prisma/client'

export type TenantResponse = Omit<
  Tenant,
  'deletedAt' | 'statusId' | 'typeId' | 'companyId'
> & {
  status: TenantStatus
  type: TenantType
  company: Company
}
