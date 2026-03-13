import z from 'zod'

import { UserLoginResponseSchema } from '@auth/schemas/user-login-response.schema'

export type UserLoginResponse = z.infer<typeof UserLoginResponseSchema>