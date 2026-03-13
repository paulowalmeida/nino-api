import z from 'zod'

import { UserSchema } from './user.schema'

export const UserCreatedSchema = UserSchema.omit({
}).extend({
  createdAt: z.date().transform(d => d.toISOString()),
  updatedAt: z.date().transform(d => d.toISOString()),
  personalData: UserSchema.shape.personalData
    .omit({
      avatarUrl: true,
      birthDate: true,
      password: true,
    })
})

