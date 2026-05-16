import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Cliente Anthropic — APENAS server-side.
 * Import "server-only" garante erro de build se acidentalmente
 * importado em código client.
 */

if (!process.env.ANTHROPIC_API_KEY) {
  // Warning em desenvolvimento; falha em produção quando usado.
  console.warn("[catavento] ANTHROPIC_API_KEY não configurada");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AI_MODELS = {
  /** Modelo leve para classificação de escopo e tarefas rápidas */
  fast: "claude-haiku-4-5-20251001",
  /** Modelo principal para chat e análises */
  main: "claude-sonnet-4-6",
} as const;
