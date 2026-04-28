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

@Entity({ schema: 'public', name: 'company_responsibles' })
export class CompanyResponsible {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  companyId: string

  @Column()
  name: string

  @Column()
  cpf: string

  @Column()
  email: string

  @Column()
  phone: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company
}
