import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator'

export class CreateCompanyResponsibleDto {
  @IsUUID()
  @IsNotEmpty()
  companyId: string

  @IsString()
  name: string

  @IsString()
  cpf: string

  @IsPhoneNumber('BR')
  phone: string

  @IsEmail()
  email: string
}
