import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "PATHFINDER" | "LEADER" | "PARENT";
      status?: "PENDING" | "APPROVED" | "REJECTED";
      primaryFunction?: string;
      secondaryFunction?: string;
      isAdmin?: boolean;
      isMedia?: boolean;
      canManageUsers?: boolean;
      canManageContent?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role?: "PATHFINDER" | "LEADER" | "PARENT";
    status?: "PENDING" | "APPROVED" | "REJECTED";
    primaryFunction?: string | null;
    secondaryFunction?: string | null;
    isAdmin?: boolean;
    isMedia?: boolean;
    canManageUsers?: boolean;
    canManageContent?: boolean;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    image?: string | null;
  }
}