import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLES_KEY } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { TenantRole } from '@shared/enums/tenant-role.enum'
import { AuthRequest } from '@shared/types/auth-request.type'

type AnyRole = GlobalRole | TenantRole

/**
 * RBAC guard. Reads the `@Roles(...)` metadata set on the handler or controller
 * and compares it against `request.user.role` populated by `JwtAuthGuard`.
 *
 * Behaviour:
 * - No `@Roles` decorator → access granted (public-within-auth endpoint).
 * - `@Roles` present → user's role must be in the allowed list, otherwise 403.
 *
 * Always pair with `JwtAuthGuard` so `request.user` is guaranteed to exist:
 * `@UseGuards(JwtAuthGuard, RolesGuard)`
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * @param context - NestJS execution context providing the HTTP request and handler metadata.
   * @returns `true` if access is allowed, `false` otherwise (NestJS converts to 403).
   */
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
