import { SetMetadata } from '@nestjs/common'

import { GlobalRole } from '@shared/enums/global-role.enum'
import { TenantRole } from '@shared/enums/tenant-role.enum'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: (GlobalRole | TenantRole)[]) =>
  SetMetadata(ROLES_KEY, roles)
