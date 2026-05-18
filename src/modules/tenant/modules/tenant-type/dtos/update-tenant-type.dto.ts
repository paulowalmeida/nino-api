import { PartialType } from '@nestjs/mapped-types'

import { CreateTenantTypeDto } from './create-tenant-type.dto'

export class UpdateTenantTypeDto extends PartialType(CreateTenantTypeDto) {}
