import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { Role } from '@shared/enums/role.enum'
import { ROLES_KEY } from '@shared/decorators/roles.decorator'
import { AuthRequest } from '@shared/types/auth-request.type'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const endpointRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!endpointRoles?.length) return true

    const { user } = context.switchToHttp().getRequest<AuthRequest>()
    return endpointRoles.includes(user.role as Role)
  }
}
