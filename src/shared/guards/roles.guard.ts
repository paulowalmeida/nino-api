import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLES_KEY } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { TenantRole } from '@shared/enums/tenant-role.enum'
import { AuthRequest } from '@shared/types/auth-request.type'

type AnyRole = GlobalRole | TenantRole

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const endpointRoles = this.reflector.getAllAndOverride<AnyRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!endpointRoles?.length) return true

    const { user } = context.switchToHttp().getRequest<AuthRequest>()
    return endpointRoles.includes(user.role as AnyRole)
  }
}
