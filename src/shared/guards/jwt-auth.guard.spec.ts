import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthGuard } from '@nestjs/passport'

import { IS_PUBLIC_KEY } from '@shared/decorators/public.decorator'
import { JwtAuthGuard } from './jwt-auth.guard'

const mockContext = (): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({}),
    }),
  }) as unknown as ExecutionContext

describe(JwtAuthGuard.name, () => {
  let guard: JwtAuthGuard
  let reflector: Reflector

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard, Reflector],
    }).compile()

    guard = module.get<JwtAuthGuard>(JwtAuthGuard)
    reflector = module.get<Reflector>(Reflector)
  })

  it('should return true when endpoint is public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === IS_PUBLIC_KEY) return true
      return undefined
    })
    const ctx = mockContext()
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('should delegate to passport AuthGuard when not public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false)
    const superSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true)
    const ctx = mockContext()
    void guard.canActivate(ctx)
    expect(superSpy).toHaveBeenCalledWith(ctx)
  })
})
