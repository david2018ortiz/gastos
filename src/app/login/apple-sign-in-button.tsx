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
      className="w-full rounded-md bg-black text-white py-2 font-medium"
    >
      Continuar con Apple
    </button>
  );
}
