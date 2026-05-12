import { BusinessCategory, CompanyBusinessCategory } from '@prisma/client'

export type CompanyBusinessCategoryWithCategory = CompanyBusinessCategory & {
  businessCategory: BusinessCategory
}
