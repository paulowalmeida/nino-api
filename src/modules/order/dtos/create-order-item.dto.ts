import { IsInt, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator'

export class CreateOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @IsInt()
  @Min(1)
  quantity: number

  @IsNumber()
  @Min(0)
  unitPrice: number
}
