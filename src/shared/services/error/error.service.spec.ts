import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { QueryFailedError } from 'typeorm'

import { ErrorService } from './error.service'

const makeQueryFailedError = (pgCode: string): QueryFailedError => {
  const error = new QueryFailedError('SELECT 1', [], new Error('db error'))
  ;(error as any).driverError = { code: pgCode }
  return error
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

  describe('QueryFailedError — PostgreSQL codes', () => {
    it('should throw ConflictException for unique violation (23505)', () => {
      const error = makeQueryFailedError('23505')
      expect(() => service.handle(error)).toThrow(ConflictException)
      expect(() => service.handle(error)).toThrow('Unique constraint failed')
    })

    it('should throw BadRequestException for foreign key violation (23503)', () => {
      const error = makeQueryFailedError('23503')
      expect(() => service.handle(error)).toThrow(BadRequestException)
      expect(() => service.handle(error)).toThrow('Foreign key constraint failed')
    })

    it('should throw BadRequestException for not null violation (23502)', () => {
      const error = makeQueryFailedError('23502')
      expect(() => service.handle(error)).toThrow(BadRequestException)
      expect(() => service.handle(error)).toThrow('Required field is missing')
    })

    it('should use customMessage when provided for unique violation', () => {
      const error = makeQueryFailedError('23505')
      expect(() => service.handle(error, 'Email already taken')).toThrow('Email already taken')
    })

    it('should use customMessage when provided for foreign key violation', () => {
      const error = makeQueryFailedError('23503')
      expect(() => service.handle(error, 'Referenced record does not exist')).toThrow(
        'Referenced record does not exist',
      )
    })

    it('should rethrow QueryFailedError for unknown pg codes', () => {
      const error = makeQueryFailedError('99999')
      expect(() => service.handle(error)).toThrow(error)
    })

    it('should rethrow QueryFailedError when driverError has no code', () => {
      const error = new QueryFailedError('SELECT 1', [], new Error('db error'))
      ;(error as any).driverError = {}
      expect(() => service.handle(error)).toThrow(error)
    })
  })

  describe('Generic Error with "not found" message', () => {
    it('should throw NotFoundException for error containing "not found"', () => {
      const error = new Error('record not found in database')
      expect(() => service.handle(error)).toThrow(NotFoundException)
      expect(() => service.handle(error)).toThrow('record not found in database')
    })

    it('should use customMessage when provided', () => {
      const error = new Error('record not found')
      expect(() => service.handle(error, 'User not found')).toThrow('User not found')
    })

    it('should be case-sensitive — not match "Not Found" uppercase', () => {
      const error = new Error('Not Found')
      expect(() => service.handle(error)).not.toThrow(NotFoundException)
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
