import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'public', name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  cnpj: string;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  legalName: string;

  @Column({ nullable: true })
  stateRegistration: string;

  @Column({ nullable: true })
  legalNature: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
