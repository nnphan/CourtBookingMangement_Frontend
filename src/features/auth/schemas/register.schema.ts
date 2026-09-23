import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().trim().min(1, 'auth.errors.emailRequired').email('auth.errors.emailInvalid'),
    fullName: z
      .string()
      .trim()
      .min(1, 'auth.errors.fullNameRequired')
      .min(2, 'auth.errors.fullNameShort')
      .max(60, 'auth.errors.fullNameShort'),
    password: z.string().min(1, 'auth.errors.passwordRequired').min(6, 'auth.errors.passwordShort'),
    phoneNumber: z
      .string()
      .trim()
      .min(1, 'auth.errors.phoneRequired')
      .regex(/^\d{9,10}$/, 'auth.errors.phoneInvalid'),
  })
  .strict();

export type RegisterFormValues = z.infer<typeof registerSchema>;
