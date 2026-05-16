import { z } from "zod";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // limite do bcrypt usado pelo Supabase

export const emailSchema = z
  .string()
  .min(1, "E-mail é obrigatório")
  .email("E-mail inválido")
  .max(254, "E-mail muito longo")
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Senha precisa de pelo menos ${PASSWORD_MIN} caracteres`)
  .max(PASSWORD_MAX, `Senha muito longa (máximo ${PASSWORD_MAX})`)
  .regex(/[a-z]/, "Senha precisa de pelo menos uma letra minúscula")
  .regex(/[A-Z]/, "Senha precisa de pelo menos uma letra maiúscula")
  .regex(/[0-9]/, "Senha precisa de pelo menos um número");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z
    .string()
    .min(2, "Nome muito curto")
    .max(120, "Nome muito longo")
    .trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
