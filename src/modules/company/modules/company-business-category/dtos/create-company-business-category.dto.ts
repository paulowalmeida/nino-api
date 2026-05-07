import { IsUUID } from 'class-validator'

export class CreateCompanyBusinessCategoryDto {
  @IsUUID()
  businessCategoryId: string
}
