import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateBusinessCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
