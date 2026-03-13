import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserRoleScalarFieldEnumSchema = z.enum(['id','code','description']);

export const PersonalDataScalarFieldEnumSchema = z.enum(['id','email','password','firstName','lastName','avatarUrl','birthDate']);

export const UserScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','hashedRefreshToken','roleId','personalDataId']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER ROLE SCHEMA
/////////////////////////////////////////

export const UserRoleSchema = z.object({
  id: z.string().uuid(),
  code: z.number().int(),
  description: z.string(),
})

export type UserRole = z.infer<typeof UserRoleSchema>

/////////////////////////////////////////
// PERSONAL DATA SCHEMA
/////////////////////////////////////////

export const PersonalDataSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().nullable(),
  birthDate: z.coerce.date().nullable(),
})

export type PersonalData = z.infer<typeof PersonalDataSchema>

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  hashedRefreshToken: z.string().nullable(),
  roleId: z.string(),
  personalDataId: z.string(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER ROLE
//------------------------------------------------------

export const UserRoleIncludeSchema: z.ZodType<Prisma.UserRoleInclude> = z.object({
  users: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserRoleCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const UserRoleArgsSchema: z.ZodType<Prisma.UserRoleDefaultArgs> = z.object({
  select: z.lazy(() => UserRoleSelectSchema).optional(),
  include: z.lazy(() => UserRoleIncludeSchema).optional(),
}).strict();

export const UserRoleCountOutputTypeArgsSchema: z.ZodType<Prisma.UserRoleCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserRoleCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserRoleCountOutputTypeSelectSchema: z.ZodType<Prisma.UserRoleCountOutputTypeSelect> = z.object({
  users: z.boolean().optional(),
}).strict();

export const UserRoleSelectSchema: z.ZodType<Prisma.UserRoleSelect> = z.object({
  id: z.boolean().optional(),
  code: z.boolean().optional(),
  description: z.boolean().optional(),
  users: z.union([z.boolean(),z.lazy(() => UserFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserRoleCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PERSONAL DATA
//------------------------------------------------------

export const PersonalDataIncludeSchema: z.ZodType<Prisma.PersonalDataInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export const PersonalDataArgsSchema: z.ZodType<Prisma.PersonalDataDefaultArgs> = z.object({
  select: z.lazy(() => PersonalDataSelectSchema).optional(),
  include: z.lazy(() => PersonalDataIncludeSchema).optional(),
}).strict();

export const PersonalDataSelectSchema: z.ZodType<Prisma.PersonalDataSelect> = z.object({
  id: z.boolean().optional(),
  email: z.boolean().optional(),
  password: z.boolean().optional(),
  firstName: z.boolean().optional(),
  lastName: z.boolean().optional(),
  avatarUrl: z.boolean().optional(),
  birthDate: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  role: z.union([z.boolean(),z.lazy(() => UserRoleArgsSchema)]).optional(),
  personalData: z.union([z.boolean(),z.lazy(() => PersonalDataArgsSchema)]).optional(),
}).strict();

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  hashedRefreshToken: z.boolean().optional(),
  roleId: z.boolean().optional(),
  personalDataId: z.boolean().optional(),
  role: z.union([z.boolean(),z.lazy(() => UserRoleArgsSchema)]).optional(),
  personalData: z.union([z.boolean(),z.lazy(() => PersonalDataArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserRoleWhereInputSchema: z.ZodType<Prisma.UserRoleWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserRoleWhereInputSchema), z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleWhereInputSchema), z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  code: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  users: z.lazy(() => UserListRelationFilterSchema).optional(),
}).strict();

export const UserRoleOrderByWithRelationInputSchema: z.ZodType<Prisma.UserRoleOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  users: z.lazy(() => UserOrderByRelationAggregateInputSchema).optional(),
}).strict();

export const UserRoleWhereUniqueInputSchema: z.ZodType<Prisma.UserRoleWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    code: z.number().int(),
    description: z.string(),
  }),
  z.object({
    id: z.uuid(),
    code: z.number().int(),
  }),
  z.object({
    id: z.uuid(),
    description: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    code: z.number().int(),
    description: z.string(),
  }),
  z.object({
    code: z.number().int(),
  }),
  z.object({
    description: z.string(),
  }),
])
.and(z.object({
  id: z.uuid().optional(),
  code: z.number().int().optional(),
  description: z.string().optional(),
  AND: z.union([ z.lazy(() => UserRoleWhereInputSchema), z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleWhereInputSchema), z.lazy(() => UserRoleWhereInputSchema).array() ]).optional(),
  users: z.lazy(() => UserListRelationFilterSchema).optional(),
}).strict());

export const UserRoleOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserRoleOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserRoleCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserRoleAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserRoleMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserRoleMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserRoleSumOrderByAggregateInputSchema).optional(),
}).strict();

export const UserRoleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserRoleScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema), z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema), z.lazy(() => UserRoleScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  code: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  description: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
}).strict();

export const PersonalDataWhereInputSchema: z.ZodType<Prisma.PersonalDataWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PersonalDataWhereInputSchema), z.lazy(() => PersonalDataWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PersonalDataWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PersonalDataWhereInputSchema), z.lazy(() => PersonalDataWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  avatarUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  birthDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict();

export const PersonalDataOrderByWithRelationInputSchema: z.ZodType<Prisma.PersonalDataOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  avatarUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  birthDate: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
}).strict();

export const PersonalDataWhereUniqueInputSchema: z.ZodType<Prisma.PersonalDataWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    email: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.object({
  id: z.uuid().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => PersonalDataWhereInputSchema), z.lazy(() => PersonalDataWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PersonalDataWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PersonalDataWhereInputSchema), z.lazy(() => PersonalDataWhereInputSchema).array() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  avatarUrl: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  birthDate: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export const PersonalDataOrderByWithAggregationInputSchema: z.ZodType<Prisma.PersonalDataOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  avatarUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  birthDate: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => PersonalDataCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PersonalDataMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PersonalDataMinOrderByAggregateInputSchema).optional(),
}).strict();

export const PersonalDataScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PersonalDataScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PersonalDataScalarWhereWithAggregatesInputSchema), z.lazy(() => PersonalDataScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PersonalDataScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PersonalDataScalarWhereWithAggregatesInputSchema), z.lazy(() => PersonalDataScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  firstName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  lastName: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  avatarUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  birthDate: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
}).strict();

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  hashedRefreshToken: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  roleId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  personalDataId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  role: z.union([ z.lazy(() => UserRoleScalarRelationFilterSchema), z.lazy(() => UserRoleWhereInputSchema) ]).optional(),
  personalData: z.union([ z.lazy(() => PersonalDataScalarRelationFilterSchema), z.lazy(() => PersonalDataWhereInputSchema) ]).optional(),
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedRefreshToken: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  roleId: z.lazy(() => SortOrderSchema).optional(),
  personalDataId: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => UserRoleOrderByWithRelationInputSchema).optional(),
  personalData: z.lazy(() => PersonalDataOrderByWithRelationInputSchema).optional(),
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    personalDataId: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    personalDataId: z.string(),
  }),
])
.and(z.object({
  id: z.uuid().optional(),
  personalDataId: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  hashedRefreshToken: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  roleId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  role: z.union([ z.lazy(() => UserRoleScalarRelationFilterSchema), z.lazy(() => UserRoleWhereInputSchema) ]).optional(),
  personalData: z.union([ z.lazy(() => PersonalDataScalarRelationFilterSchema), z.lazy(() => PersonalDataWhereInputSchema) ]).optional(),
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedRefreshToken: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  roleId: z.lazy(() => SortOrderSchema).optional(),
  personalDataId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema), z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  hashedRefreshToken: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  roleId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  personalDataId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
}).strict();

export const UserRoleCreateInputSchema: z.ZodType<Prisma.UserRoleCreateInput> = z.object({
  id: z.uuid().optional(),
  code: z.number().int(),
  description: z.string(),
  users: z.lazy(() => UserCreateNestedManyWithoutRoleInputSchema).optional(),
}).strict();

export const UserRoleUncheckedCreateInputSchema: z.ZodType<Prisma.UserRoleUncheckedCreateInput> = z.object({
  id: z.uuid().optional(),
  code: z.number().int(),
  description: z.string(),
  users: z.lazy(() => UserUncheckedCreateNestedManyWithoutRoleInputSchema).optional(),
}).strict();

export const UserRoleUpdateInputSchema: z.ZodType<Prisma.UserRoleUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  users: z.lazy(() => UserUpdateManyWithoutRoleNestedInputSchema).optional(),
}).strict();

export const UserRoleUncheckedUpdateInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  users: z.lazy(() => UserUncheckedUpdateManyWithoutRoleNestedInputSchema).optional(),
}).strict();

export const UserRoleCreateManyInputSchema: z.ZodType<Prisma.UserRoleCreateManyInput> = z.object({
  id: z.uuid().optional(),
  code: z.number().int(),
  description: z.string(),
}).strict();

export const UserRoleUpdateManyMutationInputSchema: z.ZodType<Prisma.UserRoleUpdateManyMutationInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PersonalDataCreateInputSchema: z.ZodType<Prisma.PersonalDataCreateInput> = z.object({
  id: z.uuid().optional(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutPersonalDataInputSchema).optional(),
}).strict();

export const PersonalDataUncheckedCreateInputSchema: z.ZodType<Prisma.PersonalDataUncheckedCreateInput> = z.object({
  id: z.uuid().optional(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserUncheckedCreateNestedOneWithoutPersonalDataInputSchema).optional(),
}).strict();

export const PersonalDataUpdateInputSchema: z.ZodType<Prisma.PersonalDataUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatarUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  birthDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUpdateOneWithoutPersonalDataNestedInputSchema).optional(),
}).strict();

export const PersonalDataUncheckedUpdateInputSchema: z.ZodType<Prisma.PersonalDataUncheckedUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatarUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  birthDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user: z.lazy(() => UserUncheckedUpdateOneWithoutPersonalDataNestedInputSchema).optional(),
}).strict();

export const PersonalDataCreateManyInputSchema: z.ZodType<Prisma.PersonalDataCreateManyInput> = z.object({
  id: z.uuid().optional(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
}).strict();

export const PersonalDataUpdateManyMutationInputSchema: z.ZodType<Prisma.PersonalDataUpdateManyMutationInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatarUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  birthDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const PersonalDataUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PersonalDataUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatarUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  birthDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hashedRefreshToken: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleCreateNestedOneWithoutUsersInputSchema),
  personalData: z.lazy(() => PersonalDataCreateNestedOneWithoutUserInputSchema),
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hashedRefreshToken: z.string().optional().nullable(),
  roleId: z.string(),
  personalDataId: z.string(),
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedRefreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.lazy(() => UserRoleUpdateOneRequiredWithoutUsersNestedInputSchema).optional(),
  personalData: z.lazy(() => PersonalDataUpdateOneRequiredWithoutUserNestedInputSchema).optional(),
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedRefreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roleId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  personalDataId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hashedRefreshToken: z.string().optional().nullable(),
  roleId: z.string(),
  personalDataId: z.string(),
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedRefreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedRefreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roleId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  personalDataId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const UserListRelationFilterSchema: z.ZodType<Prisma.UserListRelationFilter> = z.object({
  every: z.lazy(() => UserWhereInputSchema).optional(),
  some: z.lazy(() => UserWhereInputSchema).optional(),
  none: z.lazy(() => UserWhereInputSchema).optional(),
}).strict();

export const UserOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const UserRoleCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const UserRoleAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleAvgOrderByAggregateInput> = z.object({
  code: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const UserRoleMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const UserRoleMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const UserRoleSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserRoleSumOrderByAggregateInput> = z.object({
  code: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const UserNullableScalarRelationFilterSchema: z.ZodType<Prisma.UserNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserWhereInputSchema).optional().nullable(),
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
}).strict();

export const PersonalDataCountOrderByAggregateInputSchema: z.ZodType<Prisma.PersonalDataCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  avatarUrl: z.lazy(() => SortOrderSchema).optional(),
  birthDate: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const PersonalDataMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PersonalDataMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  avatarUrl: z.lazy(() => SortOrderSchema).optional(),
  birthDate: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const PersonalDataMinOrderByAggregateInputSchema: z.ZodType<Prisma.PersonalDataMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  firstName: z.lazy(() => SortOrderSchema).optional(),
  lastName: z.lazy(() => SortOrderSchema).optional(),
  avatarUrl: z.lazy(() => SortOrderSchema).optional(),
  birthDate: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
}).strict();

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const UserRoleScalarRelationFilterSchema: z.ZodType<Prisma.UserRoleScalarRelationFilter> = z.object({
  is: z.lazy(() => UserRoleWhereInputSchema).optional(),
  isNot: z.lazy(() => UserRoleWhereInputSchema).optional(),
}).strict();

export const PersonalDataScalarRelationFilterSchema: z.ZodType<Prisma.PersonalDataScalarRelationFilter> = z.object({
  is: z.lazy(() => PersonalDataWhereInputSchema).optional(),
  isNot: z.lazy(() => PersonalDataWhereInputSchema).optional(),
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedRefreshToken: z.lazy(() => SortOrderSchema).optional(),
  roleId: z.lazy(() => SortOrderSchema).optional(),
  personalDataId: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedRefreshToken: z.lazy(() => SortOrderSchema).optional(),
  roleId: z.lazy(() => SortOrderSchema).optional(),
  personalDataId: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  hashedRefreshToken: z.lazy(() => SortOrderSchema).optional(),
  roleId: z.lazy(() => SortOrderSchema).optional(),
  personalDataId: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
}).strict();

export const UserCreateNestedManyWithoutRoleInputSchema: z.ZodType<Prisma.UserCreateNestedManyWithoutRoleInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRoleInputSchema), z.lazy(() => UserCreateWithoutRoleInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutRoleInputSchema), z.lazy(() => UserCreateOrConnectWithoutRoleInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyRoleInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserUncheckedCreateNestedManyWithoutRoleInputSchema: z.ZodType<Prisma.UserUncheckedCreateNestedManyWithoutRoleInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRoleInputSchema), z.lazy(() => UserCreateWithoutRoleInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutRoleInputSchema), z.lazy(() => UserCreateOrConnectWithoutRoleInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyRoleInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
}).strict();

export const UserUpdateManyWithoutRoleNestedInputSchema: z.ZodType<Prisma.UserUpdateManyWithoutRoleNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRoleInputSchema), z.lazy(() => UserCreateWithoutRoleInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutRoleInputSchema), z.lazy(() => UserCreateOrConnectWithoutRoleInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutRoleInputSchema), z.lazy(() => UserUpsertWithWhereUniqueWithoutRoleInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyRoleInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutRoleInputSchema), z.lazy(() => UserUpdateWithWhereUniqueWithoutRoleInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutRoleInputSchema), z.lazy(() => UserUpdateManyWithWhereWithoutRoleInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserUncheckedUpdateManyWithoutRoleNestedInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutRoleNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutRoleInputSchema), z.lazy(() => UserCreateWithoutRoleInputSchema).array(), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserCreateOrConnectWithoutRoleInputSchema), z.lazy(() => UserCreateOrConnectWithoutRoleInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserUpsertWithWhereUniqueWithoutRoleInputSchema), z.lazy(() => UserUpsertWithWhereUniqueWithoutRoleInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserCreateManyRoleInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserWhereUniqueInputSchema), z.lazy(() => UserWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserUpdateWithWhereUniqueWithoutRoleInputSchema), z.lazy(() => UserUpdateWithWhereUniqueWithoutRoleInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserUpdateManyWithWhereWithoutRoleInputSchema), z.lazy(() => UserUpdateManyWithWhereWithoutRoleInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutPersonalDataInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutPersonalDataInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedCreateWithoutPersonalDataInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPersonalDataInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
}).strict();

export const UserUncheckedCreateNestedOneWithoutPersonalDataInputSchema: z.ZodType<Prisma.UserUncheckedCreateNestedOneWithoutPersonalDataInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedCreateWithoutPersonalDataInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPersonalDataInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable(),
}).strict();

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable(),
}).strict();

export const UserUpdateOneWithoutPersonalDataNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutPersonalDataNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedCreateWithoutPersonalDataInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPersonalDataInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPersonalDataInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPersonalDataInputSchema), z.lazy(() => UserUpdateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPersonalDataInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateOneWithoutPersonalDataNestedInputSchema: z.ZodType<Prisma.UserUncheckedUpdateOneWithoutPersonalDataNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedCreateWithoutPersonalDataInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutPersonalDataInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutPersonalDataInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutPersonalDataInputSchema), z.lazy(() => UserUpdateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPersonalDataInputSchema) ]).optional(),
}).strict();

export const UserRoleCreateNestedOneWithoutUsersInputSchema: z.ZodType<Prisma.UserRoleCreateNestedOneWithoutUsersInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUsersInputSchema), z.lazy(() => UserRoleUncheckedCreateWithoutUsersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserRoleCreateOrConnectWithoutUsersInputSchema).optional(),
  connect: z.lazy(() => UserRoleWhereUniqueInputSchema).optional(),
}).strict();

export const PersonalDataCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.PersonalDataCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => PersonalDataCreateWithoutUserInputSchema), z.lazy(() => PersonalDataUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PersonalDataCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => PersonalDataWhereUniqueInputSchema).optional(),
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional(),
}).strict();

export const UserRoleUpdateOneRequiredWithoutUsersNestedInputSchema: z.ZodType<Prisma.UserRoleUpdateOneRequiredWithoutUsersNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUsersInputSchema), z.lazy(() => UserRoleUncheckedCreateWithoutUsersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserRoleCreateOrConnectWithoutUsersInputSchema).optional(),
  upsert: z.lazy(() => UserRoleUpsertWithoutUsersInputSchema).optional(),
  connect: z.lazy(() => UserRoleWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserRoleUpdateToOneWithWhereWithoutUsersInputSchema), z.lazy(() => UserRoleUpdateWithoutUsersInputSchema), z.lazy(() => UserRoleUncheckedUpdateWithoutUsersInputSchema) ]).optional(),
}).strict();

export const PersonalDataUpdateOneRequiredWithoutUserNestedInputSchema: z.ZodType<Prisma.PersonalDataUpdateOneRequiredWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => PersonalDataCreateWithoutUserInputSchema), z.lazy(() => PersonalDataUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PersonalDataCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => PersonalDataUpsertWithoutUserInputSchema).optional(),
  connect: z.lazy(() => PersonalDataWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PersonalDataUpdateToOneWithWhereWithoutUserInputSchema), z.lazy(() => PersonalDataUpdateWithoutUserInputSchema), z.lazy(() => PersonalDataUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
}).strict();

export const UserCreateWithoutRoleInputSchema: z.ZodType<Prisma.UserCreateWithoutRoleInput> = z.object({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hashedRefreshToken: z.string().optional().nullable(),
  personalData: z.lazy(() => PersonalDataCreateNestedOneWithoutUserInputSchema),
}).strict();

export const UserUncheckedCreateWithoutRoleInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutRoleInput> = z.object({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hashedRefreshToken: z.string().optional().nullable(),
  personalDataId: z.string(),
}).strict();

export const UserCreateOrConnectWithoutRoleInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutRoleInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutRoleInputSchema), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema) ]),
}).strict();

export const UserCreateManyRoleInputEnvelopeSchema: z.ZodType<Prisma.UserCreateManyRoleInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserCreateManyRoleInputSchema), z.lazy(() => UserCreateManyRoleInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserUpsertWithWhereUniqueWithoutRoleInputSchema: z.ZodType<Prisma.UserUpsertWithWhereUniqueWithoutRoleInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserUpdateWithoutRoleInputSchema), z.lazy(() => UserUncheckedUpdateWithoutRoleInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutRoleInputSchema), z.lazy(() => UserUncheckedCreateWithoutRoleInputSchema) ]),
}).strict();

export const UserUpdateWithWhereUniqueWithoutRoleInputSchema: z.ZodType<Prisma.UserUpdateWithWhereUniqueWithoutRoleInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserUpdateWithoutRoleInputSchema), z.lazy(() => UserUncheckedUpdateWithoutRoleInputSchema) ]),
}).strict();

export const UserUpdateManyWithWhereWithoutRoleInputSchema: z.ZodType<Prisma.UserUpdateManyWithWhereWithoutRoleInput> = z.object({
  where: z.lazy(() => UserScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserUpdateManyMutationInputSchema), z.lazy(() => UserUncheckedUpdateManyWithoutRoleInputSchema) ]),
}).strict();

export const UserScalarWhereInputSchema: z.ZodType<Prisma.UserScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereInputSchema), z.lazy(() => UserScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  hashedRefreshToken: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  roleId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  personalDataId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
}).strict();

export const UserCreateWithoutPersonalDataInputSchema: z.ZodType<Prisma.UserCreateWithoutPersonalDataInput> = z.object({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hashedRefreshToken: z.string().optional().nullable(),
  role: z.lazy(() => UserRoleCreateNestedOneWithoutUsersInputSchema),
}).strict();

export const UserUncheckedCreateWithoutPersonalDataInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutPersonalDataInput> = z.object({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hashedRefreshToken: z.string().optional().nullable(),
  roleId: z.string(),
}).strict();

export const UserCreateOrConnectWithoutPersonalDataInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutPersonalDataInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedCreateWithoutPersonalDataInputSchema) ]),
}).strict();

export const UserUpsertWithoutPersonalDataInputSchema: z.ZodType<Prisma.UserUpsertWithoutPersonalDataInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPersonalDataInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedCreateWithoutPersonalDataInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
}).strict();

export const UserUpdateToOneWithWhereWithoutPersonalDataInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutPersonalDataInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutPersonalDataInputSchema), z.lazy(() => UserUncheckedUpdateWithoutPersonalDataInputSchema) ]),
}).strict();

export const UserUpdateWithoutPersonalDataInputSchema: z.ZodType<Prisma.UserUpdateWithoutPersonalDataInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedRefreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  role: z.lazy(() => UserRoleUpdateOneRequiredWithoutUsersNestedInputSchema).optional(),
}).strict();

export const UserUncheckedUpdateWithoutPersonalDataInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutPersonalDataInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedRefreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  roleId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleCreateWithoutUsersInputSchema: z.ZodType<Prisma.UserRoleCreateWithoutUsersInput> = z.object({
  id: z.uuid().optional(),
  code: z.number().int(),
  description: z.string(),
}).strict();

export const UserRoleUncheckedCreateWithoutUsersInputSchema: z.ZodType<Prisma.UserRoleUncheckedCreateWithoutUsersInput> = z.object({
  id: z.uuid().optional(),
  code: z.number().int(),
  description: z.string(),
}).strict();

export const UserRoleCreateOrConnectWithoutUsersInputSchema: z.ZodType<Prisma.UserRoleCreateOrConnectWithoutUsersInput> = z.object({
  where: z.lazy(() => UserRoleWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUsersInputSchema), z.lazy(() => UserRoleUncheckedCreateWithoutUsersInputSchema) ]),
}).strict();

export const PersonalDataCreateWithoutUserInputSchema: z.ZodType<Prisma.PersonalDataCreateWithoutUserInput> = z.object({
  id: z.uuid().optional(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
}).strict();

export const PersonalDataUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.PersonalDataUncheckedCreateWithoutUserInput> = z.object({
  id: z.uuid().optional(),
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
}).strict();

export const PersonalDataCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.PersonalDataCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => PersonalDataWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PersonalDataCreateWithoutUserInputSchema), z.lazy(() => PersonalDataUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserRoleUpsertWithoutUsersInputSchema: z.ZodType<Prisma.UserRoleUpsertWithoutUsersInput> = z.object({
  update: z.union([ z.lazy(() => UserRoleUpdateWithoutUsersInputSchema), z.lazy(() => UserRoleUncheckedUpdateWithoutUsersInputSchema) ]),
  create: z.union([ z.lazy(() => UserRoleCreateWithoutUsersInputSchema), z.lazy(() => UserRoleUncheckedCreateWithoutUsersInputSchema) ]),
  where: z.lazy(() => UserRoleWhereInputSchema).optional(),
}).strict();

export const UserRoleUpdateToOneWithWhereWithoutUsersInputSchema: z.ZodType<Prisma.UserRoleUpdateToOneWithWhereWithoutUsersInput> = z.object({
  where: z.lazy(() => UserRoleWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserRoleUpdateWithoutUsersInputSchema), z.lazy(() => UserRoleUncheckedUpdateWithoutUsersInputSchema) ]),
}).strict();

export const UserRoleUpdateWithoutUsersInputSchema: z.ZodType<Prisma.UserRoleUpdateWithoutUsersInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserRoleUncheckedUpdateWithoutUsersInputSchema: z.ZodType<Prisma.UserRoleUncheckedUpdateWithoutUsersInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const PersonalDataUpsertWithoutUserInputSchema: z.ZodType<Prisma.PersonalDataUpsertWithoutUserInput> = z.object({
  update: z.union([ z.lazy(() => PersonalDataUpdateWithoutUserInputSchema), z.lazy(() => PersonalDataUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => PersonalDataCreateWithoutUserInputSchema), z.lazy(() => PersonalDataUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => PersonalDataWhereInputSchema).optional(),
}).strict();

export const PersonalDataUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.PersonalDataUpdateToOneWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => PersonalDataWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PersonalDataUpdateWithoutUserInputSchema), z.lazy(() => PersonalDataUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const PersonalDataUpdateWithoutUserInputSchema: z.ZodType<Prisma.PersonalDataUpdateWithoutUserInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatarUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  birthDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const PersonalDataUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.PersonalDataUncheckedUpdateWithoutUserInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  firstName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  lastName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  avatarUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  birthDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const UserCreateManyRoleInputSchema: z.ZodType<Prisma.UserCreateManyRoleInput> = z.object({
  id: z.uuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hashedRefreshToken: z.string().optional().nullable(),
  personalDataId: z.string(),
}).strict();

export const UserUpdateWithoutRoleInputSchema: z.ZodType<Prisma.UserUpdateWithoutRoleInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedRefreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  personalData: z.lazy(() => PersonalDataUpdateOneRequiredWithoutUserNestedInputSchema).optional(),
}).strict();

export const UserUncheckedUpdateWithoutRoleInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutRoleInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedRefreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  personalDataId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateManyWithoutRoleInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyWithoutRoleInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  hashedRefreshToken: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  personalDataId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserRoleFindFirstArgsSchema: z.ZodType<Prisma.UserRoleFindFirstArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereInputSchema.optional(), 
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(), UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRoleScalarFieldEnumSchema, UserRoleScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserRoleFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserRoleFindFirstOrThrowArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereInputSchema.optional(), 
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(), UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRoleScalarFieldEnumSchema, UserRoleScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserRoleFindManyArgsSchema: z.ZodType<Prisma.UserRoleFindManyArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereInputSchema.optional(), 
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(), UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserRoleScalarFieldEnumSchema, UserRoleScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserRoleAggregateArgsSchema: z.ZodType<Prisma.UserRoleAggregateArgs> = z.object({
  where: UserRoleWhereInputSchema.optional(), 
  orderBy: z.union([ UserRoleOrderByWithRelationInputSchema.array(), UserRoleOrderByWithRelationInputSchema ]).optional(),
  cursor: UserRoleWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserRoleGroupByArgsSchema: z.ZodType<Prisma.UserRoleGroupByArgs> = z.object({
  where: UserRoleWhereInputSchema.optional(), 
  orderBy: z.union([ UserRoleOrderByWithAggregationInputSchema.array(), UserRoleOrderByWithAggregationInputSchema ]).optional(),
  by: UserRoleScalarFieldEnumSchema.array(), 
  having: UserRoleScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserRoleFindUniqueArgsSchema: z.ZodType<Prisma.UserRoleFindUniqueArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema, 
}).strict();

export const UserRoleFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserRoleFindUniqueOrThrowArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema, 
}).strict();

export const PersonalDataFindFirstArgsSchema: z.ZodType<Prisma.PersonalDataFindFirstArgs> = z.object({
  select: PersonalDataSelectSchema.optional(),
  include: PersonalDataIncludeSchema.optional(),
  where: PersonalDataWhereInputSchema.optional(), 
  orderBy: z.union([ PersonalDataOrderByWithRelationInputSchema.array(), PersonalDataOrderByWithRelationInputSchema ]).optional(),
  cursor: PersonalDataWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PersonalDataScalarFieldEnumSchema, PersonalDataScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PersonalDataFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PersonalDataFindFirstOrThrowArgs> = z.object({
  select: PersonalDataSelectSchema.optional(),
  include: PersonalDataIncludeSchema.optional(),
  where: PersonalDataWhereInputSchema.optional(), 
  orderBy: z.union([ PersonalDataOrderByWithRelationInputSchema.array(), PersonalDataOrderByWithRelationInputSchema ]).optional(),
  cursor: PersonalDataWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PersonalDataScalarFieldEnumSchema, PersonalDataScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PersonalDataFindManyArgsSchema: z.ZodType<Prisma.PersonalDataFindManyArgs> = z.object({
  select: PersonalDataSelectSchema.optional(),
  include: PersonalDataIncludeSchema.optional(),
  where: PersonalDataWhereInputSchema.optional(), 
  orderBy: z.union([ PersonalDataOrderByWithRelationInputSchema.array(), PersonalDataOrderByWithRelationInputSchema ]).optional(),
  cursor: PersonalDataWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PersonalDataScalarFieldEnumSchema, PersonalDataScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PersonalDataAggregateArgsSchema: z.ZodType<Prisma.PersonalDataAggregateArgs> = z.object({
  where: PersonalDataWhereInputSchema.optional(), 
  orderBy: z.union([ PersonalDataOrderByWithRelationInputSchema.array(), PersonalDataOrderByWithRelationInputSchema ]).optional(),
  cursor: PersonalDataWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PersonalDataGroupByArgsSchema: z.ZodType<Prisma.PersonalDataGroupByArgs> = z.object({
  where: PersonalDataWhereInputSchema.optional(), 
  orderBy: z.union([ PersonalDataOrderByWithAggregationInputSchema.array(), PersonalDataOrderByWithAggregationInputSchema ]).optional(),
  by: PersonalDataScalarFieldEnumSchema.array(), 
  having: PersonalDataScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PersonalDataFindUniqueArgsSchema: z.ZodType<Prisma.PersonalDataFindUniqueArgs> = z.object({
  select: PersonalDataSelectSchema.optional(),
  include: PersonalDataIncludeSchema.optional(),
  where: PersonalDataWhereUniqueInputSchema, 
}).strict();

export const PersonalDataFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PersonalDataFindUniqueOrThrowArgs> = z.object({
  select: PersonalDataSelectSchema.optional(),
  include: PersonalDataIncludeSchema.optional(),
  where: PersonalDataWhereUniqueInputSchema, 
}).strict();

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(), 
  having: UserScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserRoleCreateArgsSchema: z.ZodType<Prisma.UserRoleCreateArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  data: z.union([ UserRoleCreateInputSchema, UserRoleUncheckedCreateInputSchema ]),
}).strict();

export const UserRoleUpsertArgsSchema: z.ZodType<Prisma.UserRoleUpsertArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema, 
  create: z.union([ UserRoleCreateInputSchema, UserRoleUncheckedCreateInputSchema ]),
  update: z.union([ UserRoleUpdateInputSchema, UserRoleUncheckedUpdateInputSchema ]),
}).strict();

export const UserRoleCreateManyArgsSchema: z.ZodType<Prisma.UserRoleCreateManyArgs> = z.object({
  data: z.union([ UserRoleCreateManyInputSchema, UserRoleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserRoleCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserRoleCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserRoleCreateManyInputSchema, UserRoleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserRoleDeleteArgsSchema: z.ZodType<Prisma.UserRoleDeleteArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  where: UserRoleWhereUniqueInputSchema, 
}).strict();

export const UserRoleUpdateArgsSchema: z.ZodType<Prisma.UserRoleUpdateArgs> = z.object({
  select: UserRoleSelectSchema.optional(),
  include: UserRoleIncludeSchema.optional(),
  data: z.union([ UserRoleUpdateInputSchema, UserRoleUncheckedUpdateInputSchema ]),
  where: UserRoleWhereUniqueInputSchema, 
}).strict();

export const UserRoleUpdateManyArgsSchema: z.ZodType<Prisma.UserRoleUpdateManyArgs> = z.object({
  data: z.union([ UserRoleUpdateManyMutationInputSchema, UserRoleUncheckedUpdateManyInputSchema ]),
  where: UserRoleWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserRoleUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserRoleUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserRoleUpdateManyMutationInputSchema, UserRoleUncheckedUpdateManyInputSchema ]),
  where: UserRoleWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserRoleDeleteManyArgsSchema: z.ZodType<Prisma.UserRoleDeleteManyArgs> = z.object({
  where: UserRoleWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PersonalDataCreateArgsSchema: z.ZodType<Prisma.PersonalDataCreateArgs> = z.object({
  select: PersonalDataSelectSchema.optional(),
  include: PersonalDataIncludeSchema.optional(),
  data: z.union([ PersonalDataCreateInputSchema, PersonalDataUncheckedCreateInputSchema ]),
}).strict();

export const PersonalDataUpsertArgsSchema: z.ZodType<Prisma.PersonalDataUpsertArgs> = z.object({
  select: PersonalDataSelectSchema.optional(),
  include: PersonalDataIncludeSchema.optional(),
  where: PersonalDataWhereUniqueInputSchema, 
  create: z.union([ PersonalDataCreateInputSchema, PersonalDataUncheckedCreateInputSchema ]),
  update: z.union([ PersonalDataUpdateInputSchema, PersonalDataUncheckedUpdateInputSchema ]),
}).strict();

export const PersonalDataCreateManyArgsSchema: z.ZodType<Prisma.PersonalDataCreateManyArgs> = z.object({
  data: z.union([ PersonalDataCreateManyInputSchema, PersonalDataCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PersonalDataCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PersonalDataCreateManyAndReturnArgs> = z.object({
  data: z.union([ PersonalDataCreateManyInputSchema, PersonalDataCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PersonalDataDeleteArgsSchema: z.ZodType<Prisma.PersonalDataDeleteArgs> = z.object({
  select: PersonalDataSelectSchema.optional(),
  include: PersonalDataIncludeSchema.optional(),
  where: PersonalDataWhereUniqueInputSchema, 
}).strict();

export const PersonalDataUpdateArgsSchema: z.ZodType<Prisma.PersonalDataUpdateArgs> = z.object({
  select: PersonalDataSelectSchema.optional(),
  include: PersonalDataIncludeSchema.optional(),
  data: z.union([ PersonalDataUpdateInputSchema, PersonalDataUncheckedUpdateInputSchema ]),
  where: PersonalDataWhereUniqueInputSchema, 
}).strict();

export const PersonalDataUpdateManyArgsSchema: z.ZodType<Prisma.PersonalDataUpdateManyArgs> = z.object({
  data: z.union([ PersonalDataUpdateManyMutationInputSchema, PersonalDataUncheckedUpdateManyInputSchema ]),
  where: PersonalDataWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PersonalDataUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PersonalDataUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PersonalDataUpdateManyMutationInputSchema, PersonalDataUncheckedUpdateManyInputSchema ]),
  where: PersonalDataWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PersonalDataDeleteManyArgsSchema: z.ZodType<Prisma.PersonalDataDeleteManyArgs> = z.object({
  where: PersonalDataWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
}).strict();

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
  create: z.union([ UserCreateInputSchema, UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
}).strict();

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema, UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema, UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema, 
}).strict();

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UserUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();