import { AuthRepository } from "@auth/auth.repository";

export type NewUser = Awaited<ReturnType<typeof AuthRepository.prototype.registerNewUser>>