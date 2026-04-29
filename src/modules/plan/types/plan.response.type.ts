import { Plan } from '@plan/entities/plan.entity'

export type PlanResponse = Omit<Plan, 'typeId' | 'type'> & {
  type: { name: string }
}
