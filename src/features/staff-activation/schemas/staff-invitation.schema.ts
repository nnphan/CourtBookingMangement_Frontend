import { z } from 'zod';

const token = z.string().regex(/^[A-Za-z0-9_-]{43}$/, 'staffActivation.errors.invalidLink');

const email = z.string().trim().email('staffActivation.errors.invalidLink');

const passwordCategories = (value: string) =>
  [
    /\p{Ll}/u.test(value),
    /\p{Lu}/u.test(value),
    /\p{Nd}/u.test(value),
    /[^\p{L}\p{Nd}]/u.test(value),
  ].filter(Boolean).length;

export const staffInvitationLinkSchema = z.object({ token, email });

export const staffInvitationPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, 'staffActivation.errors.passwordPolicy')
      .refine((value) => new TextEncoder().encode(value).length <= 72, {
        message: 'staffActivation.errors.passwordPolicy',
      })
      .refine((value) => passwordCategories(value) >= 3, {
        message: 'staffActivation.errors.passwordPolicy',
      }),
    confirmPassword: z.string().min(1, 'staffActivation.errors.confirmPasswordRequired'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'staffActivation.errors.passwordMismatch',
  });

export const staffInvitationActivationSchema = staffInvitationLinkSchema.and(
  staffInvitationPasswordSchema,
);

export type StaffInvitationLink = z.infer<typeof staffInvitationLinkSchema>;
export type StaffInvitationPasswordValues = z.infer<typeof staffInvitationPasswordSchema>;
export type StaffInvitationActivationValues = z.infer<typeof staffInvitationActivationSchema>;
