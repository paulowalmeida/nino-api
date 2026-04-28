import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ schema: 'public', name: 'user_tenants' })
export class UserTenant {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
