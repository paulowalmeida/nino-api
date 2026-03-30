import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

@Injectable()
export class PrismaErrorService {
  private readonly errorMap = {
    P2025: (customMessage?: string) =>
      new NotFoundException(customMessage || 'Resource not found'),
    P2002: (customMessage?: string) =>
      new ConflictException(customMessage || 'Unique constraint failed'),
    P2003: (customMessage?: string) =>
      new BadRequestException(customMessage || 'Foreign key constraint failed'),
  }

  handleError(error: unknown, customMessage?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const handler = this.errorMap[error.code as keyof typeof this.errorMap]
      if (handler) throw handler(customMessage)
    }
    throw error
  }
}
