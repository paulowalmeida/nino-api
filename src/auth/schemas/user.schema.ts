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

// user.schema.ts
export const UserSchema = UserBaseSchema.extend({
  personalData: UserBaseSchema.shape.personalData.extend({
    birthDate: z.date().nullable(),
  }),
})

// schema com transforms separado — usado só no parse do repository
export const UserSchemaParsed = UserSchema.transform(data => ({
  ...data,
  createdAt: data.createdAt.toISOString(),
  updatedAt: data.updatedAt.toISOString(),
  personalData: {
    ...data.personalData,
    birthDate: data.personalData.birthDate?.toISOString() ?? null,
  }
}))