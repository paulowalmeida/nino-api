import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class CreateCustomerAddressDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string

  @IsString()
  @IsNotEmpty()
  zipCode: string

  @IsString()
  @IsNotEmpty()
  street: string

  @IsString()
  @IsNotEmpty()
  number: string

  @IsString()
  @IsOptional()
  complement?: string

  @IsString()
  @IsNotEmpty()
  neighborhood: string

  @IsString()
  @IsNotEmpty()
  city: string

  @IsString()
  @IsNotEmpty()
  state: string

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean

  @IsString()
  @IsOptional()
  country?: string
}
