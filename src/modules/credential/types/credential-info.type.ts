export type CredentialInfo = {
  id: string
  userId: string
  email: string | null
  provider: string
  providerCode: string | null
  createdAt: Date
  updatedAt: Date
}
