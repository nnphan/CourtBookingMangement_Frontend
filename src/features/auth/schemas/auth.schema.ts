import { z } from 'zod';

/** Error strings are i18n keys; forms translate them at render time. */
const password = z
  .string()
  .min(1, 'auth.errors.passwordRequired')
  .min(6, 'auth.errors.passwordShort');

const phone = z
  .string()
  .min(1, 'auth.errors.phoneRequired')
  .regex(/^\d{9,10}$/, 'auth.errors.phoneInvalid');

const email = z.string().min(1, 'auth.errors.emailRequired').email('auth.errors.emailInvalid');

export const loginPhoneSchema = z.object({
  dialCode: z.string().default('+84'),
  phone,
  password,
});

export const loginEmailSchema = z.object({
  email,
  password,
});

export const registerSchema = z
  .object({
    dialCode: z.string().default('+84'),
    phone,
    email: z.union([z.literal(''), email]).optional(),
    fullName: z
      .string()
      .min(1, 'auth.errors.fullNameRequired')
      .min(2, 'auth.errors.fullNameShort')
      .max(60),
    password,
    confirmPassword: z.string().min(1, 'auth.errors.passwordRequired'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth.errors.confirmMismatch',
  });

export type LoginPhoneValues = z.infer<typeof loginPhoneSchema>;
export type LoginEmailValues = z.infer<typeof loginEmailSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
