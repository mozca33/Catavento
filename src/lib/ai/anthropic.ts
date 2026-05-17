import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Cliente Anthropic — APENAS server-side.
 * Import "server-only" garante erro de build se acidentalmente
 * importado em código client.
 */

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("[catavento] ANTHROPIC_API_KEY não configurada");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const AI_MODELS = {
  /** Modelo principal — chat conversacional do produto */
  main: "claude-opus-4-7",
  /** Modelo leve para classificação de escopo e tarefas curtas */
  fast: "claude-haiku-4-5",
} as const;
