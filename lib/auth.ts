import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.primaryFunction = user.primaryFunction;
        token.secondaryFunction = user.secondaryFunction;
        token.isAdmin = user.isAdmin;
        token.isMedia = user.isMedia;
        token.canManageUsers = user.canManageUsers;
        token.canManageContent = user.canManageContent;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "PATHFINDER" | "LEADER" | "PARENT";
        session.user.primaryFunction = token.primaryFunction as string | undefined;
        session.user.secondaryFunction = token.secondaryFunction as string | undefined;
        session.user.isAdmin = token.isAdmin as boolean | undefined;
        session.user.isMedia = token.isMedia as boolean | undefined;
        session.user.canManageUsers = token.canManageUsers as boolean | undefined;
        session.user.canManageContent = token.canManageContent as boolean | undefined;
      }
      return session;
    }
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          primaryFunction: user.primaryFunction,
          secondaryFunction: user.secondaryFunction,
          isAdmin: user.isAdmin,
          isMedia: user.isMedia,
          canManageUsers: user.canManageUsers,
          canManageContent: user.canManageContent
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET
});