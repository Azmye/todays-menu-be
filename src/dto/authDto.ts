import { z } from "zod";

export const RegisterDtoSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Invalid email",
    }),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8),
  username: z
    .string({
      required_error: "username is required",
    })
    .min(3),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.string().optional(),
});

export const LoginDtoSchema = z.object({
  credential: z.string({
    required_error: "Username or email is required",
  }),
  password: z.string({
    required_error: "Password is required",
  }),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
