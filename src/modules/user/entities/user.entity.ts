import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Company } from '@company/entities/company.entity'
import { Role } from '@role/entities/role.entity'

@Entity({ schema: 'public', name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ name: 'role_id' })
  roleId: string

  @Column({ name: 'company_id', nullable: true })
  companyId: string

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamp' })
  lastLoginAt: Date

  @Column({ nullable: true })
  locale: string

  @Column({ nullable: true })
  timezone: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company

}
