import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

import { GlobalRole } from '@shared/enums/global-role.enum'
import { RolesGuard } from './roles.guard'

const mockContext = (
  roles: string[] | undefined,
  userRole: string,
): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user: { role: userRole } }),
    }),
  }) as unknown as ExecutionContext

describe(RolesGuard.name, () => {
  let guard: RolesGuard
  let reflector: Reflector

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile()

    guard = module.get<RolesGuard>(RolesGuard)
    reflector = module.get<Reflector>(Reflector)
  })

  it('should return true when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined)
    const ctx = mockContext(undefined, GlobalRole.ADMIN)
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('should return true when roles list is empty', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([])
    const ctx = mockContext([], GlobalRole.ADMIN)
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('should return true when user role matches required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([GlobalRole.ADMIN])
    const ctx = mockContext([GlobalRole.ADMIN], GlobalRole.ADMIN)
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it('should return false when user role does not match required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([GlobalRole.ADMIN])
    const ctx = mockContext([GlobalRole.ADMIN], 'MERCHANT')
    expect(guard.canActivate(ctx)).toBe(false)
  })
})
