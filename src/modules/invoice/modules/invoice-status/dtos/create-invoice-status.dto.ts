import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateInvoiceStatusDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
