import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { User, UserType } from '@/lib/types';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
    error: '/login', // Add error page redirect
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login');
      const isOnRegisterPage = nextUrl.pathname.startsWith('/register');
      const isOnAuthPage = isOnLoginPage || isOnRegisterPage;

      // Redirect from auth pages if logged in
      if (isOnAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // Require auth for all other pages
      if (!isLoggedIn) {
        let from = nextUrl.pathname;
        if (nextUrl.search) {
          from += nextUrl.search;
        }

        return Response.redirect(
          new URL(`/login?from=${encodeURIComponent(from)}`, nextUrl),
        );
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle the 'from' parameter for redirecting back to the original page
      const parsedUrl = new URL(url, baseUrl);
      const from = parsedUrl.searchParams.get('from');

      if (from && !from.startsWith('/login') && !from.startsWith('/register')) {
        return baseUrl + from;
      }

      // Default redirect to home
      return baseUrl;
    },
    async jwt({
      token,
      user: authUser,
    }: {
      token: JWT & { user?: User };
      user?: any; // Using any for NextAuth.User type to avoid conflicts
    }) {
      if (authUser) {
        // Convert NextAuth.User to our User type
        token.user = {
          id: authUser.id || authUser.email, // Fallback to email if id is undefined
          email: authUser.email || '',
          type: (authUser.type as UserType) || 'regular', // Default to 'regular' if type is undefined
          name: authUser.name,
          image: authUser.image,
        };
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { user?: User };
    }) {
      if (token.user) {
        // Ensure we're storing the correct user data in the session
        session.user = {
          ...token.user,
          // Ensure type is strictly typed as UserType
          type: token.user.type as UserType,
        };
      }
      return session;
    },
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
} satisfies NextAuthConfig;
