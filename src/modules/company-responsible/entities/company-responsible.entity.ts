import { Company } from '@company/entities/company.entity'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ schema: 'public', name: 'company_responsibles' })
export class CompanyResponsible {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'company_id' })
  companyId: string

  @Column()
  name: string

  @Column()
  cpf: string

  @Column()
  email: string

  @Column()
  phone: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company
}
