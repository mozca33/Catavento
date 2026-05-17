import { Chat } from "./chat";

export default function AssistentePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
          Assistente
        </h1>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          Pergunte sobre seu controle financeiro. A IA acessa seus dados em tempo
          real e simula cenários.
        </p>
      </div>

      <Chat />
    </div>
  );
}
