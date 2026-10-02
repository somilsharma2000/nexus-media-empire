import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        
        if (!adminEmail || !adminHash) {
          console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD_HASH");
          return null;
        }

        if (credentials.email !== adminEmail) return null;

        const isMatch = await bcrypt.compare(credentials.password as string, adminHash);
        if (isMatch) {
          return { id: "1", name: "Admin", email: adminEmail };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApi = nextUrl.pathname.startsWith('/api');
      const isDashboard = nextUrl.pathname === '/';
      
      if (isDashboard) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/admin/login', nextUrl));
      }
      
      return true;
    }
  }
});
