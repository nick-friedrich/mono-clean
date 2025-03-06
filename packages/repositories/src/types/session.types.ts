import { z } from "zod";

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  refreshToken: z.string(),
  userAgent: z.string(),
  ipAddress: z.string(),
  expiresAt: z.date(),
  isValid: z.boolean(),
  lastUsedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Session = z.infer<typeof SessionSchema>;

export const SessionUpdateInputSchema = SessionSchema.partial();

export type SessionUpdateInput = z.infer<typeof SessionUpdateInputSchema>;
