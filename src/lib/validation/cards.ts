import { z } from "zod";
import { accountKindEnum } from "./account";

export const creditCardSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(80).trim(),
  account_id: z.string().uuid("Selecione uma conta para débito"),
  kind: accountKindEnum.default("PF"),
  closing_day: z.coerce.number().int().min(1).max(31),
  due_day: z.coerce.number().int().min(1).max(31),
  autopay_day: z
    .union([z.coerce.number().int().min(1).max(31), z.literal(""), z.literal(null)])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
  credit_limit: z
    .union([z.coerce.number().min(0), z.literal(""), z.literal(null)])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
});

export type CreditCardInput = z.infer<typeof creditCardSchema>;

export const installmentSchema = z
  .object({
    description: z.string().min(1).max(120).trim(),
    target_type: z.enum(["account", "card"]),
    target_id: z.string().uuid("Selecione um destino"),
    total_amount: z.coerce.number().positive().max(999999999.99),
    installment_count: z.coerce.number().int().min(1).max(120),
    installments_paid: z.coerce.number().int().min(0).default(0),
    first_installment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    kind: accountKindEnum.default("PF"),
  })
  .refine((d) => d.installments_paid <= d.installment_count, {
    message: "Parcelas pagas não pode ser maior que o total",
    path: ["installments_paid"],
  });

export type InstallmentInput = z.infer<typeof installmentSchema>;

export const plannedEntrySchema = z.object({
  description: z.string().min(1).max(120).trim(),
  target_type: z.enum(["account", "card"]),
  target_id: z.string().uuid("Selecione um destino"),
  amount: z.coerce.number().positive().max(999999999.99),
  direction: z.enum(["in", "out"]),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: accountKindEnum.default("PF"),
}).refine(
  (d) => d.target_type !== "card" || d.direction === "out",
  { message: "Cartão só aceita saídas", path: ["direction"] },
);

export type PlannedEntryInput = z.infer<typeof plannedEntrySchema>;
