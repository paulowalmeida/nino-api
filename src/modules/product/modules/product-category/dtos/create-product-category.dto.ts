import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class CreateProductCategoryDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number
}
