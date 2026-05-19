import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { GlobalRole } from '@shared/enums/global-role.enum'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { UserTokenData } from '@user/types/user-token.data.type'

import { CustomerOwnerGuard } from './customer-owner.guard'

describe(CustomerOwnerGuard.name, () => {
  let guard: CustomerOwnerGuard

  const mockPrisma = {
    customer: {
      findFirst: jest.fn(),
    },
  }

  const makeContext = (
    user: UserTokenData,
    params: Record<string, string>,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user, params }),
      }),
    }) as unknown as ExecutionContext

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerOwnerGuard,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    guard = module.get<CustomerOwnerGuard>(CustomerOwnerGuard)
  })

  it('should allow ADMIN without ownership check', async () => {
    const ctx = makeContext(
      { sub: 'user-1', role: GlobalRole.ADMIN },
      { customerId: 'customer-1' },
    )
    const result = await guard.canActivate(ctx)
    expect(result).toBe(true)
    expect(mockPrisma.customer.findFirst).not.toHaveBeenCalled()
  })

  it('should allow SUPPORT without ownership check', async () => {
    const ctx = makeContext(
      { sub: 'user-1', role: GlobalRole.SUPPORT },
      { customerId: 'customer-1' },
    )
    const result = await guard.canActivate(ctx)
    expect(result).toBe(true)
    expect(mockPrisma.customer.findFirst).not.toHaveBeenCalled()
  })

  it('should allow CUSTOMER who owns the record', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue({ id: 'customer-1' })
    const ctx = makeContext(
      { sub: 'user-1', role: GlobalRole.CUSTOMER },
      { customerId: 'customer-1' },
    )
    const result = await guard.canActivate(ctx)
    expect(result).toBe(true)
    expect(mockPrisma.customer.findFirst).toHaveBeenCalledWith({
      where: { id: 'customer-1', userId: 'user-1', deletedAt: null },
    })
  })

  it('should throw ForbiddenException when CUSTOMER does not own the record', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue(null)
    const ctx = makeContext(
      { sub: 'user-1', role: GlobalRole.CUSTOMER },
      { customerId: 'customer-1' },
    )
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException)
  })

  it('should resolve customerId from id param on top-level routes', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue({ id: 'customer-1' })
    const ctx = makeContext(
      { sub: 'user-1', role: GlobalRole.CUSTOMER },
      { id: 'customer-1' },
    )
    await guard.canActivate(ctx)
    expect(mockPrisma.customer.findFirst).toHaveBeenCalledWith({
      where: { id: 'customer-1', userId: 'user-1', deletedAt: null },
    })
  })

  it('should return false when no customerId or id param is present', async () => {
    const ctx = makeContext(
      { sub: 'user-1', role: GlobalRole.CUSTOMER },
      {},
    )
    const result = await guard.canActivate(ctx)
    expect(result).toBe(false)
  })

  it('should enforce ownership for non-bypass roles', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue(null)
    const ctx = makeContext(
      { sub: 'user-1', role: GlobalRole.MERCHANT },
      { customerId: 'customer-1' },
    )
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException)
  })
})
