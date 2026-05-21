import { IsIn, IsString } from 'class-validator'

export class OrderDto {
  @IsString()
  target: string

  @IsIn(['asc', 'desc'])
  direction: 'asc' | 'desc'
}
