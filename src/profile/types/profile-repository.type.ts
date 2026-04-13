import { Prisma } from '@prisma/client'

export type Profile = Prisma.ProfileGetPayload<{
  include: {
    addresses: {
      omit: {
        profileId: true
      }
    }
    contacts: {
      omit: {
        profileId: true
      }
    }
  }
}>
