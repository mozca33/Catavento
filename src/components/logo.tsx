/**
 * Logo Catavento — wordmark + símbolo de catavento (4 pás coloridas)
 * Cores derivam da paleta "Brisa".
 */

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function Logo({
  size = 28,
  showWordmark = true,
  className = "",
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span
          className="font-semibold tracking-tight text-[color:var(--text-primary)]"
          style={{ fontSize: size * 0.72 }}
        >
          Catavento
        </span>
      )}
    </span>
  );
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Catavento"
    >
      {/* 4 pás, partindo do centro, cada uma com cor */}
      <path
        d="M16 16 L16 4 Q22 6 22 12 Z"
        fill="#2563EB"
      />
      <path
        d="M16 16 L28 16 Q26 22 20 22 Z"
        fill="#F97066"
      />
      <path
        d="M16 16 L16 28 Q10 26 10 20 Z"
        fill="#10B981"
      />
      <path
        d="M16 16 L4 16 Q6 10 12 10 Z"
        fill="#F59E0B"
      />
      {/* Eixo central */}
      <circle cx="16" cy="16" r="2.2" fill="#0F172A" />
    </svg>
  );
}
