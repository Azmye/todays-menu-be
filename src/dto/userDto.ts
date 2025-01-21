import { User } from "@db/schema/user";
import { z } from "zod";

declare module "hono" {
  interface ContextVariables {
    user: User;
    userRoles: string[];
  }
}

export const UserUpdateDtoSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type UserUpdateDto = z.infer<typeof UserUpdateDtoSchema>;
