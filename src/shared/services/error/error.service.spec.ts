import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client.js'

import { ErrorService } from './error.service'

const makePrismaError = (code: string): PrismaClientKnownRequestError => {
  return new PrismaClientKnownRequestError('db error', {
    code,
    clientVersion: '7.0.0',
  })
}

describe(ErrorService.name, () => {
  let service: ErrorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorService],
    }).compile()

    service = module.get<ErrorService>(ErrorService)
  })

  describe('HttpException passthrough', () => {
    it('should rethrow NotFoundException as-is', () => {
      const error = new NotFoundException('Role not found')
      expect(() => service.handle(error)).toThrow(NotFoundException)
      expect(() => service.handle(error)).toThrow('Role not found')
    })

    it('should rethrow ConflictException as-is', () => {
      const error = new ConflictException('Already exists')
      expect(() => service.handle(error)).toThrow(ConflictException)
      expect(() => service.handle(error)).toThrow('Already exists')
    })

    it('should rethrow any HttpException without modification', () => {
      const error = new HttpException('Custom HTTP error', 418)
      expect(() => service.handle(error)).toThrow(HttpException)
      expect(() => service.handle(error)).toThrow('Custom HTTP error')
    })
  })

  describe('PrismaClientKnownRequestError codes', () => {
    it('should throw ConflictException for P2002 (unique constraint)', () => {
      const error = makePrismaError('P2002')
      expect(() => service.handle(error)).toThrow(ConflictException)
      expect(() => service.handle(error)).toThrow('Unique constraint failed')
    })

    it('should throw BadRequestException for P2003 (foreign key constraint)', () => {
      const error = makePrismaError('P2003')
      expect(() => service.handle(error)).toThrow(BadRequestException)
      expect(() => service.handle(error)).toThrow(
        'Foreign key constraint failed',
      )
    })

    it('should throw NotFoundException for P2025 (record not found)', () => {
      const error = makePrismaError('P2025')
      expect(() => service.handle(error)).toThrow(NotFoundException)
      expect(() => service.handle(error)).toThrow('Record not found')
    })

    it('should throw BadRequestException for P2014 (required relation missing)', () => {
      const error = makePrismaError('P2014')
      expect(() => service.handle(error)).toThrow(BadRequestException)
      expect(() => service.handle(error)).toThrow('Required relation missing')
    })

    it('should use customMessage when provided for P2002', () => {
      const error = makePrismaError('P2002')
      expect(() => service.handle(error, 'Email already taken')).toThrow(
        'Email already taken',
      )
    })

    it('should use customMessage when provided for P2003', () => {
      const error = makePrismaError('P2003')
      expect(() =>
        service.handle(error, 'Referenced record does not exist'),
      ).toThrow('Referenced record does not exist')
    })

    it('should rethrow PrismaClientKnownRequestError for unknown codes', () => {
      const error = makePrismaError('P9999')
      expect(() => service.handle(error)).toThrow(error)
    })
  })

  describe('Unknown errors', () => {
    it('should rethrow generic Error as-is', () => {
      const error = new Error('Unexpected failure')
      expect(() => service.handle(error)).toThrow(error)
    })

    it('should rethrow non-Error objects', () => {
      const error = { message: 'raw object error' }
      expect(() => service.handle(error)).toThrow()
    })
  })
})
