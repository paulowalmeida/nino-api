import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ schema: 'public', name: 'credentials' })
@Unique(['userId', 'provider'])
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ unique: true, nullable: true })
  email: string

  @Column({ nullable: true })
  password: string

  @Column({ default: 'local' })
  provider: string

  @Column({ name: 'provider_id', nullable: true })
  providerId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date
}
