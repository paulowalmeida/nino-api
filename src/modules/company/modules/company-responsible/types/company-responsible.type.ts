import { CompanyResponsible, Company } from '@prisma/client'

export type CompanyResponsibleResponse = Omit<
  CompanyResponsible,
  'deletedAt'
> & { companies: Company[] }
