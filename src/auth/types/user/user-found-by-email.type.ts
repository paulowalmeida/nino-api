import { AuthRepository } from '@auth/auth.repository';

export type UserFoundByEmail = Awaited<ReturnType<typeof AuthRepository.prototype.findByEmail>>