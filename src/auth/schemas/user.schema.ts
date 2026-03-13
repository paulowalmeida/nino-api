import z from 'zod'

import { 
  UserSchema as UserPrismaSchema,
  PersonalDataSchema,
  UserRoleSchema
} from 'prisma/generated/zod'

const UserBaseSchema = UserPrismaSchema.omit({
  roleId: true,
  personalDataId: true,
}).extend({
  personalData: PersonalDataSchema.omit({
    id: true,
  }),
  role: UserRoleSchema.omit({
    id: true,
  })
})

export const UserSchema = UserBaseSchema.extend({
  createdAt: z.date().transform(d => d.toISOString()),
  updatedAt: z.date().transform(d => d.toISOString()),
  personalData: PersonalDataSchema.extend({
    birthDate: z.date().nullable().transform(d => d?.toISOString() ?? null),
  }),
})
