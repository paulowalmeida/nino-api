import z from 'zod'

import { UserSchema } from '@auth/schemas/user.schema'

export type User = z.infer<typeof UserSchema>