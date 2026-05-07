import { PartialType } from '@nestjs/swagger'

import { CreateCompanyResponsibleDto } from './create-company-responsible.dto'

export class UpdateCompanyResponsibleDto extends PartialType(
  CreateCompanyResponsibleDto,
) {}
