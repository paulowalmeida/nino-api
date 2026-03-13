import z from 'zod'

import { UserSchemaParsed } from '@auth/schemas/user.schema'

export type UserParsed = z.infer<typeof UserSchemaParsed>