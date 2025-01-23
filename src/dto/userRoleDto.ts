import { z } from "zod";

export const UserRoleDtoSchema = z.object({
  userUuid: z.string({
    message: "UUID is required",
  }),
  newRoles: z.array(z.string()),
});

export type UserRoleDto = z.infer<typeof UserRoleDtoSchema>;
