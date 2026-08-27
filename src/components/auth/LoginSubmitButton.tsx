"use client";

import { useFormStatus } from "react-dom";

type LoginSubmitButtonProps = {
  label?: string;
  pendingLabel?: string;
};

export function LoginSubmitButton({
  label = "Log in",
  pendingLabel = "Signing in…",
}: LoginSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 min-h-11 w-full rounded-[20px] bg-brand px-4 text-body font-medium text-white transition-colors duration-150 hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
