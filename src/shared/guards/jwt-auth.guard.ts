import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * JWT authentication guard. Validates the `Bearer` token in the `Authorization`
 * header using the `jwt` Passport strategy (`JwtAuthStrategy`).
 * On success, attaches the decoded payload to `request.user`.
 * On failure, throws `UnauthorizedException` (401).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
