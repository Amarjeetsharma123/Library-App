import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const enteredOtp = credentials.otp as string | undefined;

        // Dynamically import to keep Edge runtime free of Node-specific dependencies
        const { db } = await import('@/lib/db');
        const bcrypt = (await import('bcryptjs')).default;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || user.isBlocked || !user.isVerified) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        // Verify OTP code
        if (enteredOtp) {
          const otpRecord = await db.loginOtp.findUnique({
            where: { email: user.email },
          });

          if (!otpRecord || otpRecord.otp !== enteredOtp || otpRecord.expiresAt < new Date()) {
            return null;
          }

          // Delete OTP after verification
          await db.loginOtp.delete({
            where: { email: user.email },
          });
        } else {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
        token.isVerified = (user as any).isVerified;
      }
      if (trigger === 'update' && session) {
        token.name = session.name || token.name;
        token.avatar = session.avatar || token.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.avatar = token.avatar as string | null;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
