import { Company, CompanyResponsible } from '@prisma/client'

export type CompanyResponsibleWithCompanies = CompanyResponsible & {
  companies: Company[]
}
