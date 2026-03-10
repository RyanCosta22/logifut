import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { AuthErrors } from "@/lib/errors";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "email",
          type: "string",
          placeholder: "exemplo@exemplo.com",
        },
        password: { label: "password", type: "password" },
      },

      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw AuthErrors.noCredentials();
        }

        const { email, password } = credentials;
        
        const user = await prisma.user.findUnique({ 
          where: { email } 
        });

        if (!user || !user.password) {
          throw AuthErrors.userNotFound();
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
          throw AuthErrors.invalidCredentials();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.email = token.email as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/entrar",
    signOut: "/entrar",
  },
};
export default NextAuth(authOptions);
