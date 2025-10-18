import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createGuestUser, getUser, createOAuthUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  secret: 'your-super-secret-key-here-for-nextauth',
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD); // Dummy compare for timing
          return null;
        }
        const [user] = users;
        if (!user.password) {
          await compare(password, DUMMY_PASSWORD); // Dummy compare for timing
          return null;
        }
        const passwordsMatch = await compare(password, user.password);
        if (!passwordsMatch) return null;
        return { ...user, type: 'regular' };
      },
    }),
    Credentials({
      id: 'guest',
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: 'guest' };
      },
    }),
    GoogleProvider({
      clientId:
        '953020067780-gm1j1hjo9g29hv8fqcsosjc23dssbin6.apps.googleusercontent.com',
      clientSecret: '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',
      profile(profile) {
        // Do not set verified
        return {
          id: profile.sub,
          email: profile.email,
          type: 'regular',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Ensure Google user is saved to database
        try {
          const users = await getUser(user.email || '');
          if (users.length === 0) {
            // Create new user from Google OAuth
            await createOAuthUser(user.email || '');
          }
          return true;
        } catch (error) {
          console.error('Error handling Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
