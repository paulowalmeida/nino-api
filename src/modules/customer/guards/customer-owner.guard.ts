import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

import { GlobalRole } from '@shared/enums/global-role.enum'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { AuthRequest } from '@shared/types/auth-request.type'

/**
 * Ownership guard for customer-scoped endpoints.
 *
 * Skips the ownership check only for ADMIN and SUPPORT roles — they can
 * access any customer record. Any other role (including CUSTOMER) must own
 * the target record. Resolves the customer ID from `customerId` (nested
 * routes) or `id` (top-level `/customers/:id`) and verifies that the
 * authenticated user's Customer record matches. Throws 403 otherwise.
 *
 * Always pair with `JwtAuthGuard` and `RolesGuard` before this guard:
 * `@UseGuards(JwtAuthGuard, RolesGuard, CustomerOwnerGuard)`
 */
@Injectable()
export class CustomerOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>()

    const bypassRoles: string[] = [GlobalRole.ADMIN, GlobalRole.SUPPORT]
    if (bypassRoles.includes(req.user.role)) return true

    const param = req.params['customerId'] ?? req.params['id']
    const customerId = typeof param === 'string' ? param : undefined
    if (!customerId) return false

    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, userId: req.user.sub, deletedAt: null },
    })

    if (!customer) throw new ForbiddenException()

    return true
  }
}
