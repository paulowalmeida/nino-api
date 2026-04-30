import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm'

import { PlanType } from '@plan-type/entities/plan-type.entity'

@Entity({ schema: 'public', name: 'plans' })
export class Plan {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @Column({ unique: true })
  slug: string

  @Column({ name: 'type_id' })
  typeId: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @Column({ name: 'max_tenants' })
  maxTenants: number

  @Column({ name: 'max_products' })
  maxProducts: number

  @Column({ name: 'max_orders' })
  maxOrders: number

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @ManyToOne(() => PlanType)
  @JoinColumn({ name: 'type_id' })
  type: PlanType

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date
}
