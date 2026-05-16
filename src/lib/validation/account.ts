import { z } from "zod";

export const accountKindEnum = z.enum(["PF", "PJ"]);
export const accountTypeEnum = z.enum([
  "checking",
  "savings",
  "investment",
  "cash",
  "other",
]);

export const accountSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(80, "Nome muito longo").trim(),
  type: accountTypeEnum.default("checking"),
  kind: accountKindEnum.default("PF"),
  current_balance: z.coerce
    .number({ message: "Saldo deve ser numérico" })
    .finite()
    .min(-999999999.99)
    .max(999999999.99),
  balance_as_of: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
});

export type AccountInput = z.infer<typeof accountSchema>;
