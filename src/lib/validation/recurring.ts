import { z } from "zod";
import { accountKindEnum } from "./account";

const intervalUnitEnum = z.enum(["days", "weeks", "months", "years"]);

// Novo schema unificado: 3 tipos de movimento
export const movementSchema = z
  .object({
    description: z.string().min(1, "Descrição obrigatória").max(120).trim(),
    amount: z.coerce.number().positive().max(999999999.99),
    movement_type: z.enum(["income", "expense", "transfer"]),
    from_account_id: z.string().uuid("Selecione a conta de origem"),
    // Pra "expense" no cartão: card_id, sem account_id
    use_card: z
      .preprocess((v) => v === "true" || v === true, z.boolean())
      .default(false),
    card_id: z.string().uuid().optional(),
    // Pra "transfer": to_account_id obrigatório
    to_account_id: z.string().uuid().optional(),
    interval_count: z.coerce.number().int().min(1).max(365),
    interval_unit: intervalUnitEnum,
    day_of_month: z.coerce.number().int().min(1).max(31).optional(),
    month_of_year: z.coerce.number().int().min(1).max(12).optional(),
    kind: accountKindEnum.default("PF"),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .refine(
    (d) =>
      d.movement_type !== "transfer" ||
      (d.to_account_id !== undefined && d.to_account_id !== d.from_account_id),
    {
      message: "Selecione uma conta de destino diferente da origem",
      path: ["to_account_id"],
    },
  )
  .refine(
    (d) => d.movement_type !== "income" || !d.use_card,
    { message: "Entradas não podem ser em cartão", path: ["use_card"] },
  )
  .refine(
    (d) => !d.use_card || d.card_id !== undefined,
    { message: "Selecione um cartão", path: ["card_id"] },
  )
  .refine(
    (d) => d.interval_unit !== "years" || d.month_of_year !== undefined,
    { message: "Informe o mês para frequência anual", path: ["month_of_year"] },
  );

export type MovementInput = z.infer<typeof movementSchema>;
