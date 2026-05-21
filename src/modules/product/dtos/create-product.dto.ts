import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator'

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @Min(0)
  price: number

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number

  @IsUUID()
  categoryId: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
