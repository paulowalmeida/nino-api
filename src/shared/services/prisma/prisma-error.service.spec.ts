import { Test, TestingModule } from '@nestjs/testing'
import { Prisma } from '@prisma/client'
import { PrismaErrorService } from './prisma-error.service'

describe('PrismaErrorService', () => {
  let service: PrismaErrorService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaErrorService],
    }).compile()

    service = module.get<PrismaErrorService>(PrismaErrorService)
  })

  describe('PrismaErrorService Unit Tests', () => {
    it('should throw NotFoundException for P2025', () => {
      const error = new Prisma.PrismaClientKnownRequestError('err', {
        code: 'P2025',
        clientVersion: '1',
      })
      expect(() => service.handleError(error)).toThrow('Resource not found')
    })

    it('should throw ConflictException for P2002', () => {
      const error = new Prisma.PrismaClientKnownRequestError('err', {
        code: 'P2002',
        clientVersion: '1',
      })
      expect(() => service.handleError(error)).toThrow(
        'Unique constraint failed',
      )
    })

    it('should throw BadRequestException for P2003', () => {
      const error = new Prisma.PrismaClientKnownRequestError('err', {
        code: 'P2003',
        clientVersion: '1',
      })
      expect(() => service.handleError(error)).toThrow(
        'Foreign key constraint failed',
      )
    })

    it('should throw custom message when provided', () => {
      const error = new Prisma.PrismaClientKnownRequestError('err', {
        code: 'P2025',
        clientVersion: '1',
      })
      expect(() => service.handleError(error, 'Custom msg')).toThrow(
        'Custom msg',
      )
    })

    it('should rethrow unknown Prisma error codes', () => {
      const error = new Prisma.PrismaClientKnownRequestError('err', {
        code: 'P9999',
        clientVersion: '1',
      })
      expect(() => service.handleError(error)).toThrow(error)
    })

    it('should rethrow non-Prisma errors', () => {
      const error = new Error('Random')
      expect(() => service.handleError(error)).toThrow(error)
    })
  })
})
