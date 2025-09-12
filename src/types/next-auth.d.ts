import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    dbId?: string
  }

  interface Session {
    user: {
      id: string
      dbId?: string
      name?: string | null
      email?: string | null
      image?: string | null
      provider?: string
    }
  }
}
