import { UserSchema } from "./user.schema";

export const UserLoginResponseSchema = UserSchema.omit({
  hashedRefreshToken: true,
}).extend({
  personalData: UserSchema.shape.personalData.omit({
    password: true,
  })
})