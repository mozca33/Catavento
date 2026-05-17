import { z } from "zod";
import { accountKindEnum } from "./account";

const intervalUnitEnum = z.enum(["days", "weeks", "months", "years"]);

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
    interval_count: z.coerce.number().int().min(1).max(365),
    interval_unit: intervalUnitEnum,
    day_of_month: z.coerce.number().int().min(1).max(31).optional(),
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
    (d) =>
      d.interval_unit !== "months" || d.day_of_month !== undefined,
    { message: "Para meses, informe o dia", path: ["day_of_month"] },
  )
  .refine(
    (d) =>
      d.interval_unit !== "years" ||
      (d.day_of_month !== undefined && d.month_of_year !== undefined),
    { message: "Para anos, informe dia e mês", path: ["month_of_year"] },
  )
  .refine(
    (d) => d.target_type !== "card" || d.direction === "out",
    { message: "Cartão só aceita saídas", path: ["direction"] },
  );

export type RecurringEntryInput = z.infer<typeof recurringEntrySchema>;

export const transferRuleSchema = z
  .object({
    from_account_id: z.string().uuid("Selecione a conta de origem"),
    destination_type: z.enum(["internal", "external"]),
    to_account_id: z.string().uuid().optional().or(z.literal("")),
    to_external_label: z.string().max(120).trim().optional().or(z.literal("")),
    description: z.string().min(1).max(120).trim(),
    amount: z.coerce.number().positive().max(999999999.99),
    interval_count: z.coerce.number().int().min(1).max(365),
    interval_unit: intervalUnitEnum,
    day_of_month: z.coerce.number().int().min(1).max(31).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (d) =>
      d.destination_type === "external"
        ? !!d.to_external_label && d.to_external_label.length > 0
        : !!d.to_account_id && d.to_account_id !== d.from_account_id,
    {
      message: "Destino inválido",
      path: ["to_account_id"],
    },
  );

export type TransferRuleInput = z.infer<typeof transferRuleSchema>;
