import { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      avatar?: string | null;
      isVerified: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: Role;
    avatar?: string | null;
    isVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    avatar?: string | null;
    isVerified: boolean;
  }
}
