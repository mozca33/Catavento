import { z } from "zod";

/**
 * Filtro de escopo da IA — primeira linha de defesa antes de qualquer
 * chamada ao modelo principal. Garante que apenas inputs relacionados
 * ao domínio financeiro do Catavento sejam processados.
 *
 * Etapas:
 *  1. Sanitização básica (tamanho, normalização Unicode)
 *  2. Detecção heurística de prompt injection
 *  3. Classificação semântica (TODO — usar Claude Haiku quando IA estiver integrada)
 */

const MAX_INPUT_LENGTH = 2000;

export const userInputSchema = z
  .string()
  .min(1, "Mensagem vazia")
  .max(MAX_INPUT_LENGTH, `Máximo ${MAX_INPUT_LENGTH} caracteres`);

// Padrões conhecidos de prompt injection (heurística, não exaustivo)
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|above|all)\s+(instructions?|prompts?)/i,
  /you\s+are\s+now\s+/i,
  /system\s*[:>]\s*/i,
  /<\s*\|?\s*(system|user|assistant)\s*\|?\s*>/i,
  /\[\s*INST\s*\]/i,
  /forget\s+(everything|all|your)/i,
  /disregard\s+(previous|above|the)/i,
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
 * Roda etapas 1 e 2 (sanitização + detecção de injection).
 * Etapa 3 (classificação semântica) será adicionada quando a integração
 * com Claude API estiver implementada na Fase 7.
 */
export function filterUserInput(rawInput: unknown): ScopeFilterResult {
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

  return { allowed: true, sanitized };
}
