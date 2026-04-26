import { PartialType } from '@nestjs/mapped-types'

import { CreateTenantStatusDto } from './create-tenant-status.dto'

export class UpdateTenantStatusDto extends PartialType(CreateTenantStatusDto) {}