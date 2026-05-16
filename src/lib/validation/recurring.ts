import { z } from "zod";
import { accountKindEnum } from "./account";

export const recurringEntrySchema = z
  .object({
    description: z
      .string()
      .min(1, "Descrição obrigatória")
      .max(120, "Descrição muito longa")
      .trim(),
    amount: z.coerce
      .number({ message: "Valor inválido" })
      .positive("Valor deve ser positivo")
      .max(999999999.99),
    direction: z.enum(["in", "out"]),
    frequency: z.enum(["monthly", "yearly"]).default("monthly"),
    day_of_month: z.coerce.number().int().min(1).max(31),
    month_of_year: z.coerce.number().int().min(1).max(12).optional(),
    target_type: z.enum(["account", "card"]),
    target_id: z.string().uuid("Selecione um destino"),
    kind: accountKindEnum.default("PF"),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (d) => d.frequency !== "yearly" || d.month_of_year !== undefined,
    { message: "Para anual, informe o mês", path: ["month_of_year"] },
  )
  .refine(
    (d) => d.target_type !== "card" || d.direction === "out",
    { message: "Cartão só aceita saídas", path: ["direction"] },
  );

export type RecurringEntryInput = z.infer<typeof recurringEntrySchema>;

export const transferRuleSchema = z.object({
  from_account_id: z.string().uuid("Selecione a conta de origem"),
  to_account_id: z.string().uuid("Selecione a conta de destino"),
  description: z.string().min(1).max(120).trim(),
  amount: z.coerce.number().positive().max(999999999.99),
  day_of_month: z.coerce.number().int().min(1).max(31),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
}).refine(
  (d) => d.from_account_id !== d.to_account_id,
  { message: "Origem e destino devem ser diferentes", path: ["to_account_id"] },
);

export type TransferRuleInput = z.infer<typeof transferRuleSchema>;
