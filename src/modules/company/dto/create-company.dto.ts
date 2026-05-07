import { IsOptional, IsString } from 'class-validator'

export class CreateCompanyDto {
  @IsString()
  cnpj: string

  @IsString()
  name: string

  @IsString()
  ownerId: string

  @IsString()
  responsibleId: string

  @IsOptional()
  @IsString()
  legalName?: string

  @IsOptional()
  @IsString()
  stateRegistration?: string

  @IsOptional()
  @IsString()
  legalNature?: string

  @IsOptional()
  @IsString()
  zipCode?: string

  @IsOptional()
  @IsString()
  street?: string

  @IsOptional()
  @IsString()
  number?: string

  @IsOptional()
  @IsString()
  complement?: string

  @IsOptional()
  @IsString()
  neighborhood?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  country?: string
}
