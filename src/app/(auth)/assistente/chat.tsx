"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  blocked?: boolean;
}

const SUGGESTIONS = [
  "Quanto vou ter em julho?",
  "Posso comprar uma geladeira de R$ 4.400 em 10x?",
  "Quais meus próximos eventos financeiros?",
  "Como está meu PJ vs PF?",
];

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: data.error ?? "Algo deu errado. Tente de novo.",
            blocked: true,
          },
        ]);
        return;
      }
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply, blocked: data.blocked },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Erro de conexão. Tente novamente.", blocked: true },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)]">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <EmptyState onSuggestion={send} />
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <Bubble key={i} message={m} />
            ))}
            {pending && (
              <div className="flex">
                <div className="rounded-2xl bg-[color:var(--bg-muted)] px-4 py-2 text-sm text-[color:var(--text-secondary)]">
                  <Typing />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-[color:var(--border-default)] p-4"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre suas finanças..."
            maxLength={2000}
            disabled={pending}
            className="flex-1 rounded-lg border border-[color:var(--border-default)] bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)] dark:bg-slate-950"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

function EmptyState({ onSuggestion }: { onSuggestion: (s: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="text-5xl">🤖</div>
      <h2 className="mt-4 text-xl font-semibold text-[color:var(--text-primary)]">
        Como posso ajudar?
      </h2>
      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
        Pergunte sobre seu caixa, simule compras, planeje metas.
      </p>
      <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="rounded-lg border border-[color:var(--border-default)] px-3 py-2 text-left text-sm text-[color:var(--text-primary)] transition hover:border-[color:var(--brand-primary)] hover:bg-[color:var(--bg-muted)]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? "bg-[color:var(--brand-primary)] text-white"
            : message.blocked
              ? "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
              : "bg-[color:var(--bg-muted)] text-[color:var(--text-primary)]"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <span className="inline-flex gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  );
}
