import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  slug: string

  @IsUUID()
  @IsNotEmpty()
  companyId: string

  @IsUUID()
  @IsNotEmpty()
  statusId: string

  @IsUUID()
  @IsNotEmpty()
  typeId: string

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
  @IsNotEmpty()
  neighborhood: string

  @IsString()
  @IsNotEmpty()
  city: string

  @IsString()
  @IsNotEmpty()
  state: string

  @IsString()
  @IsOptional()
  customName?: string

  @IsString()
  @IsOptional()
  logoUrl?: string

  @IsString()
  @IsOptional()
  favicon?: string

  @IsString()
  @IsOptional()
  primaryColor?: string

  @IsString()
  @IsOptional()
  secondaryColor?: string

  @IsString()
  @IsOptional()
  customDomain?: string

  @IsString()
  @IsOptional()
  complement?: string

  @IsString()
  @IsOptional()
  country?: string

  @IsString()
  @IsOptional()
  timezone?: string
}
