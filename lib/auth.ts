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
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            primaryFunction: true,
            secondaryFunction: true,
            isAdmin: true,
            isMedia: true,
            canManageUsers: true,
            canManageContent: true,
            status: true
          }
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.image = dbUser.image ?? undefined;
          session.user.role = dbUser.role as "PATHFINDER" | "LEADER" | "PARENT";
          session.user.primaryFunction = dbUser.primaryFunction ?? undefined;
          session.user.secondaryFunction = dbUser.secondaryFunction ?? undefined;
          session.user.isAdmin = dbUser.isAdmin;
          session.user.isMedia = dbUser.isMedia;
          session.user.canManageUsers = dbUser.canManageUsers;
          session.user.canManageContent = dbUser.canManageContent;
          session.user.status = dbUser.status as "PENDING" | "APPROVED" | "REJECTED";
        }
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
          throw new Error("Credenciais inválidas.");
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          throw new Error("Email ou senha inválidos.");
        }

        if (!user.isActive) {
          throw new Error("Este usuário está desativado. Procure a liderança.");
        }

        if (user.status === "PENDING") {
          throw new Error("Seu cadastro está aguardando aprovação da liderança.");
        }

        if (user.status === "REJECTED") {
          throw new Error("Seu cadastro foi rejeitado. Procure a liderança do clube.");
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error("Email ou senha inválidos.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email
        };
      }
    })
  ],

  secret: process.env.NEXTAUTH_SECRET
});