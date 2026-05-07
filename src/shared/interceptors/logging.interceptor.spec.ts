import { CallHandler, ExecutionContext } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { of, throwError } from 'rxjs'

import { LoggingInterceptor } from './logging.interceptor'

const mockContext = (method: string, url: string, statusCode = 200) =>
  ({
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ method, url }),
      getResponse: jest.fn().mockReturnValue({ statusCode }),
    }),
  }) as unknown as ExecutionContext

describe(LoggingInterceptor.name, () => {
  let interceptor: LoggingInterceptor

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile()

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor)
  })

  it('should log request on success', (done) => {
    const ctx = mockContext('GET', '/health', 200)
    const next: CallHandler = { handle: () => of({ ok: true }) }
    interceptor.intercept(ctx, next).subscribe({
      next: () => done(),
      error: done,
    })
  })

  it('should log request on error', (done) => {
    const ctx = mockContext('POST', '/auth/login', 401)
    const err = Object.assign(new Error('Unauthorized'), { status: 401 })
    const next: CallHandler = { handle: () => throwError(() => err) }
    interceptor.intercept(ctx, next).subscribe({
      next: () => done(new Error('should not succeed')),
      error: () => done(),
    })
  })

  it('should default error status to 500 when err.status is undefined', (done) => {
    const ctx = mockContext('GET', '/crash', 500)
    const err = new Error('Internal error')
    const next: CallHandler = { handle: () => throwError(() => err) }
    interceptor.intercept(ctx, next).subscribe({
      next: () => done(new Error('should not succeed')),
      error: () => done(),
    })
  })
})
