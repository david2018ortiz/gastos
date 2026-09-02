"use client";

import { createClient } from "@/lib/supabase/client";

export function AppleSignInButton() {
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="min-h-11 w-full rounded-full bg-black py-2 font-medium text-white transition-all duration-150 active:scale-[0.97] hover:opacity-90"
    >
      Continuar con Apple
    </button>
  );
}
