import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min, ValidateNested } from 'class-validator'

import { OrderDto } from './order.dto'

export class CommonQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderDto)
  order?: OrderDto
}
