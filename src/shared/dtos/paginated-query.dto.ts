import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator'

import { OrderDir } from '@shared/enums/order-dir.enum'

export class PaginatedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number = 20

  @IsOptional()
  @IsEnum(OrderDir)
  orderDir?: OrderDir = OrderDir.ASC
}
