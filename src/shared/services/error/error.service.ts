import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { QueryFailedError } from 'typeorm'

// PostgreSQL error codes
const PG_UNIQUE_VIOLATION = '23505'
const PG_FOREIGN_KEY_VIOLATION = '23503'
const PG_NOT_NULL_VIOLATION = '23502'

@Injectable()
export class ErrorService {
  private readonly pgErrorMap: Record<string, (msg?: string) => HttpException> = {
    [PG_UNIQUE_VIOLATION]: (msg) => new ConflictException(msg || 'Unique constraint failed'),
    [PG_FOREIGN_KEY_VIOLATION]: (msg) => new BadRequestException(msg || 'Foreign key constraint failed'),
    [PG_NOT_NULL_VIOLATION]: (msg) => new BadRequestException(msg || 'Required field is missing'),
  }

  handle(error: unknown, customMessage?: string): never {
    if (error instanceof HttpException) throw error

    if (error instanceof QueryFailedError) {
      const code = (error.driverError as { code?: string }).code
      const handler = code ? this.pgErrorMap[code] : undefined
      if (handler) throw handler(customMessage)
    }

    if (error instanceof Error && error.message.includes('not found')) {
      throw new NotFoundException(customMessage || error.message)
    }

    throw error
  }
}
