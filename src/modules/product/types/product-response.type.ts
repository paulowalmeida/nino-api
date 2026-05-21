import { Product, ProductCategory } from '@prisma/client'

export type ProductResponse = Omit<Product, 'categoryId' | 'deletedAt'> & {
  category: Pick<ProductCategory, 'id' | 'name'>
}
