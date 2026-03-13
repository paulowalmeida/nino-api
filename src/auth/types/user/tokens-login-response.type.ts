import { AuthService } from "@auth/auth.service";

export type TokensLoginResponse = Awaited<ReturnType<typeof AuthService.prototype['getTokens']>>