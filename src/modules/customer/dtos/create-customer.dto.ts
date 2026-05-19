import { IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateCustomerDto {
  @IsUUID()
  userId: string

  @IsString()
  @IsOptional()
  cpf?: string
}
