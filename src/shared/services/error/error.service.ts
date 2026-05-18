import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client.js'

/**
 * Centralised error handler used by BaseRepository and domain repositories.
 * Translates Prisma known-request errors into NestJS HTTP exceptions so callers
 * never need to inspect Prisma internals.
 *
 * Prisma → HTTP mapping:
 * - P2002 → `ConflictException`   (unique constraint violation)
 * - P2003 → `BadRequestException` (foreign key constraint violation)
 * - P2025 → `NotFoundException`   (record not found / update on missing row)
 * - P2014 → `BadRequestException` (required relation missing)
 *
 * `HttpException` subclasses are re-thrown as-is so guards and filters that
 * already produce a typed exception are never swallowed or re-wrapped.
 * Unknown errors bubble up unchanged.
 */
@Injectable()
export class ErrorService {
  private readonly prismaErrorMap: Record<
    string,
    (msg?: string) => HttpException
  > = {
    P2002: (msg) => new ConflictException(msg || 'Unique constraint failed'),
    P2003: (msg) =>
      new BadRequestException(msg || 'Foreign key constraint failed'),
    P2025: (msg) => new NotFoundException(msg || 'Record not found'),
    P2014: (msg) => new BadRequestException(msg || 'Required relation missing'),
  }

  /**
   * Handles an error by mapping it to the appropriate HTTP exception.
   * Always throws — return type is `never`.
   * @param error         - The caught error (Prisma, HTTP, or unknown).
   * @param customMessage - Optional message to override the default Prisma one.
   */
  handle(error: unknown, customMessage?: string): never {
    if (error instanceof HttpException) throw error

    if (error instanceof PrismaClientKnownRequestError) {
      const handler = this.prismaErrorMap[error.code]
      if (handler) throw handler(customMessage)
    }

    throw error
  }
}
