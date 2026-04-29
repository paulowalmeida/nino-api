import { CompanyResponsible } from '@company-responsible/entities/company-responsible.entity'
import { Company } from '@company/entities/company.entity'

export type CompanyResponsibleResponse = Omit<
  CompanyResponsible,
  'companyId' | 'company'
> & {
  company: Company
}
