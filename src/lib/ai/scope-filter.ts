import "server-only";
import { z } from "zod";
import { anthropic, AI_MODELS } from "./anthropic";
import { SCOPE_CLASSIFIER_PROMPT } from "./system-prompt";

/**
 * Filtro de escopo da IA — três linhas de defesa antes do modelo principal:
 *
 *   1. Sanitização básica (tamanho, normalização Unicode)
 *   2. Detecção heurística de prompt injection
 *   3. Classificação semântica via Claude Haiku (rápido e barato)
 */

const MAX_INPUT_LENGTH = 2000;

export const userInputSchema = z
  .string()
  .min(1, "Mensagem vazia")
  .max(MAX_INPUT_LENGTH, `Máximo ${MAX_INPUT_LENGTH} caracteres`);

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|above|all)\s+(instructions?|prompts?)/i,
  /you\s+are\s+now\s+/i,
  /system\s*[:>]\s*/i,
  /<\s*\|?\s*(system|user|assistant)\s*\|?\s*>/i,
  /\[\s*INST\s*\]/i,
  /forget\s+(everything|all|your)/i,
  /disregard\s+(previous|above|the)/i,
  /imprima.*system\s*prompt/i,
  /repita.*system\s*prompt/i,
];

export type ScopeFilterResult =
  | { allowed: true; sanitized: string }
  | { allowed: false; reason: ScopeFilterRejectionReason };

export type ScopeFilterRejectionReason =
  | "invalid_input"
  | "too_long"
  | "prompt_injection"
  | "out_of_scope";

export const OUT_OF_SCOPE_MESSAGE =
  "Posso te ajudar só com seu controle financeiro no Catavento. Reformule sua pergunta nesse contexto.";

/**
 * Pipeline completo de filtro: sanitização + heurística + classificação semântica.
 */
export async function filterUserInput(rawInput: unknown): Promise<ScopeFilterResult> {
  const parsed = userInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { allowed: false, reason: "invalid_input" };
  }

  const sanitized = parsed.data.normalize("NFKC").trim();

  if (sanitized.length > MAX_INPUT_LENGTH) {
    return { allowed: false, reason: "too_long" };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return { allowed: false, reason: "prompt_injection" };
    }
  }

  // Classificação semântica via Haiku — só roda se passou pelas anteriores
  const isInScope = await classifyScope(sanitized);
  if (!isInScope) {
    return { allowed: false, reason: "out_of_scope" };
  }

  return { allowed: true, sanitized };
}

async function classifyScope(text: string): Promise<boolean> {
  try {
    const response = await anthropic.messages.create({
      model: AI_MODELS.fast,
      max_tokens: 16,
      system: SCOPE_CLASSIFIER_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const out = response.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("")
      .trim()
      .toUpperCase();

    return out.startsWith("DENTRO");
  } catch (error) {
    // Em caso de erro na classificação, falhar seguro: deixar passar (modelo principal vai julgar)
    // — alternativa seria bloquear, mas isso degrada UX em queda da API
    console.error("[scope-filter] erro na classificação semântica:", error);
    return true;
  }
}
