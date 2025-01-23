import { z } from "zod";

export const roleDtoSchema = z.object({
  uuid: z.string().optional(),
  name: z
    .string({
      required_error: "Role name is required",
    })
    .trim()
    .min(1, { message: "Role name cannot be empty" })
    .optional(),
});

export type roleDto = z.infer<typeof roleDtoSchema>;
