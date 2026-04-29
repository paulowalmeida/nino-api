import { IsOptional, IsString } from 'class-validator'

export class CreateCompanyDto {
  @IsString()
  cnpj: string

  @IsString()
  companyName: string

  @IsOptional()
  @IsString()
  legalName?: string

  @IsOptional()
  @IsString()
  stateRegistration?: string

  @IsOptional()
  @IsString()
  legalNature?: string
}
