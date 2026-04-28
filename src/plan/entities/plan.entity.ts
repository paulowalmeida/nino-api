import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PlanType } from '../../plan-type/entities/plan-type.entity';

@Entity({ schema: 'public', name: 'plans' })
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  typeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  maxTenants: number;

  @Column()
  maxProducts: number;

  @Column()
  maxOrders: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => PlanType)
  @JoinColumn({ name: 'typeId' })
  type: PlanType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}