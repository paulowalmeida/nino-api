import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ schema: 'public', name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  cnpj: string

  @Column({ name: 'company_name' })
  companyName: string

  @Column({ name: 'legal_name', nullable: true })
  legalName: string

  @Column({ name: 'state_registration', nullable: true })
  stateRegistration: string

  @Column({ name: 'legal_nature', nullable: true })
  legalNature: string

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date
}
