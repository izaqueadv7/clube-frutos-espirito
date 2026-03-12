import "next-auth";

declare module "next-auth" {
  interface User {
    role: "PATHFINDER" | "LEADER" | "PARENT";
  }

  interface Session {
    user: {
      id: string;
      role: "PATHFINDER" | "LEADER" | "PARENT";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "PATHFINDER" | "LEADER" | "PARENT";
  }
}
