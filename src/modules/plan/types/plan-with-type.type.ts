import { Plan, PlanType } from '@prisma/client'

export type PlanWithType = Plan & { type: PlanType }
