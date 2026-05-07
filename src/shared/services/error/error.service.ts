import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client.js'

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

  handle(error: unknown, customMessage?: string): never {
    if (error instanceof HttpException) throw error

    if (error instanceof PrismaClientKnownRequestError) {
      const handler = this.prismaErrorMap[error.code]
      if (handler) throw handler(customMessage)
    }

    throw error
  }
}
