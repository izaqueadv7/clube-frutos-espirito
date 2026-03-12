import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["PATHFINDER", "LEADER", "PARENT"]) 
});

export const eventSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(3),
  date: z.string().datetime(),
  location: z.string().min(2)
});

export const announcementSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(5),
  audience: z.enum(["ALL", "PATHFINDER", "PARENT"]).default("ALL")
});
