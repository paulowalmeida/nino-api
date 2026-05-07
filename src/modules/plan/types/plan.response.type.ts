import { Plan, PlanType } from '@prisma/client'

export type PlanResponse = Omit<Plan, 'typeId' | 'deletedAt'> & {
  type: Pick<PlanType, 'name'>
}
