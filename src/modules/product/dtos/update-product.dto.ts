import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator'

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number

  @IsUUID()
  @IsOptional()
  categoryId?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
