import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { anthropic, AI_MODELS } from "@/lib/ai/anthropic";
import { CATAVENTO_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { TOOL_DEFINITIONS, executeTool } from "@/lib/ai/tools";
import {
  filterUserInput,
  OUT_OF_SCOPE_MESSAGE,
  type ScopeFilterRejectionReason,
} from "@/lib/ai/scope-filter";
import type Anthropic from "@anthropic-ai/sdk";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(40), // limite anti-abuso de histórico
});

const REJECTION_MESSAGES: Record<ScopeFilterRejectionReason, string> = {
  invalid_input: "Mensagem inválida.",
  too_long: "Mensagem muito longa. Resuma em até 2.000 caracteres.",
  prompt_injection: OUT_OF_SCOPE_MESSAGE,
  out_of_scope: OUT_OF_SCOPE_MESSAGE,
};

const MAX_TOOL_ITERATIONS = 5;

export async function POST(request: NextRequest) {
  // 1. Autenticação
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // 2. Validar corpo
  let body: z.infer<typeof requestSchema>;
  try {
    const json = await request.json();
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const lastUserMessage = [...body.messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    return NextResponse.json({ error: "Sem mensagem do usuário" }, { status: 400 });
  }

  // 3. Filtro de escopo (3 etapas)
  const scope = await filterUserInput(lastUserMessage.content);
  if (!scope.allowed) {
    return NextResponse.json({
      reply: REJECTION_MESSAGES[scope.reason],
      blocked: true,
      reason: scope.reason,
    });
  }

  // 4. Loop de tool use com Claude
  const messages: Anthropic.MessageParam[] = body.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    let iteration = 0;
    while (iteration < MAX_TOOL_ITERATIONS) {
      const response = await anthropic.messages.create({
        model: AI_MODELS.main,
        max_tokens: 2048,
        system: CATAVENTO_SYSTEM_PROMPT,
        tools: TOOL_DEFINITIONS,
        messages,
      });

      if (response.stop_reason === "end_turn" || response.stop_reason === "stop_sequence") {
        const text = response.content
          .filter((b) => b.type === "text")
          .map((b) => ("text" in b ? b.text : ""))
          .join("");
        return NextResponse.json({ reply: text });
      }

      if (response.stop_reason === "tool_use") {
        const toolUseBlocks = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
        );
        messages.push({ role: "assistant", content: response.content });

        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const tool of toolUseBlocks) {
          const result = await executeTool(tool.name, tool.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: result,
          });
        }
        messages.push({ role: "user", content: toolResults });
        iteration++;
        continue;
      }

      if (response.stop_reason === "refusal") {
        return NextResponse.json({
          reply: OUT_OF_SCOPE_MESSAGE,
          blocked: true,
          reason: "refusal" satisfies string,
        });
      }

      // Outro stop_reason (max_tokens, etc.) — encerrar com o que tiver
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => ("text" in b ? b.text : ""))
        .join("");
      return NextResponse.json({ reply: text || "Resposta interrompida. Tente reformular." });
    }

    return NextResponse.json({
      reply: "Não consegui resolver isso em poucos passos. Tente reformular sua pergunta.",
    });
  } catch (err) {
    console.error("[chat] erro Anthropic:", err);
    return NextResponse.json(
      { error: "Erro ao processar a mensagem. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
