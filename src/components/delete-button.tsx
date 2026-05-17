"use client";

interface Props {
  id: string;
  action: (formData: FormData) => Promise<void>;
  confirmText?: string;
  label?: string;
}

export function DeleteButton({
  id,
  action,
  confirmText = "Tem certeza? Esta ação não pode ser desfeita.",
  label = "Excluir",
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-red-600 hover:underline dark:text-red-400"
      >
        {label}
      </button>
    </form>
  );
}
