import z from 'zod'

import { UserCreatedSchema } from '@auth/schemas/user-created.schema'

export type UserCreated = z.infer<typeof UserCreatedSchema>