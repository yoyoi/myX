import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.provider = token.provider as string;
        session.user.dbId = token.dbId as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.provider = account.provider;
      }
      
      // 如果有用戶資訊，獲取資料庫用戶ID
      if (token.email && token.provider && !token.dbId) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: {
              email: token.email as string,
              provider: token.provider as string
            }
          });
          if (dbUser) {
            token.dbId = dbUser.id;
          }
        } catch (error) {
          console.error('Error getting dbId in JWT callback:', error);
        }
      }
      
      return token;
    },
    async signIn({ user, account, profile }) {
      // 確保用戶有有效的 email
      console.log('SignIn callback:', { user: user?.email, provider: account?.provider });
      try {
        return !!user.email;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // 確保重定向到正確的URL，避免多次跳轉
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
