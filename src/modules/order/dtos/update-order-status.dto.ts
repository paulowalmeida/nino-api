import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateOrderStatusDto {
  @IsUUID()
  @IsNotEmpty()
  statusId: string
}
