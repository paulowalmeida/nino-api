import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { User } from '@user/entities/user.entity'

@Entity({ schema: 'public', name: 'sessions' })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'refresh_token', unique: true, length: 500 })
  refreshToken: string

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User
}
