"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { quickAddTransaction } from "@/app/(app)/transactions/actions";
import type { QuickAddState } from "@/app/(app)/transactions/actions";
import { buttonClasses } from "@/components/button-styles";
import { CurrencyInput } from "@/components/currency-input";
import { TagPicker, type TagOption } from "@/components/tag-picker";
import { HouseholdSelect } from "@/components/household-select";
import type { HouseholdOption } from "@/lib/get-user-households";

type Category = { id: string; name: string; icon: string | null; type: string };

const initialState: QuickAddState = {
  error: null,
  success: false,
  savedAt: 0,
};

function parseSpeech(transcript: string, categories: Category[]) {
  const digits = transcript.match(/\d[\d.,]*/);
  const amount = digits ? digits[0].replace(/[.,]/g, "") : "";

  const isIncome = /ingreso|recib[íi]|me pagaron|salario|abono a favor/i.test(
    transcript,
  );

  const matchedCategory = categories.find((c) =>
    transcript.toLowerCase().includes(c.name.toLowerCase()),
  );

  return {
    amount,
    type: isIncome ? "income" : "expense",
    categoryId: matchedCategory?.id ?? "",
    note: transcript,
  };
}

export function QuickAddTransaction({
  categories,
  tags = [],
  households = [],
}: {
  categories: Category[];
  tags?: TagOption[];
  households?: HouseholdOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    quickAddTransaction,
    initialState,
  );
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [listening, setListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    );
  }, []);

  // Depende de `savedAt` (no de `success`) para que cada guardado cierre
  // el popup, incluso si el anterior también fue exitoso.
  useEffect(() => {
    if (state.savedAt > 0) {
      setOpen(false);
      setAmount("");
      setCategoryId("");
      setNote("");
      setType("expense");
    }
  }, [state.savedAt]);

  function startListening() {
    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;
    recognition.lang = "es-CO";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setLiveTranscript("");
      setListening(true);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
      let combined = "";
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i]?.[0]?.transcript ?? "";
      }
      setLiveTranscript(combined);

      const lastResult = event.results[event.results.length - 1];
      if (lastResult?.isFinal) {
        const parsed = parseSpeech(combined, categories);
        setAmount(parsed.amount);
        setType(parsed.type as "expense" | "income");
        setCategoryId(parsed.categoryId);
        setNote(parsed.note);
        recognition.stop();
      }
    };

    setOpen(true);
    recognition.start();
  }

  function cancelListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-brand-ink shadow-lg transition-transform active:scale-95"
        aria-label="Agregar transacción rápido"
      >
        +
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/30"
          onClick={() => !listening && setOpen(false)}
        >
          <div
            className="max-h-[85dvh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-surface p-5 pb-8 feedback-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Registrar rápido</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-raised"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="categoryId" value={categoryId} />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={
                    "flex-1 rounded-md py-2 text-sm font-medium transition-colors " +
                    (type === "expense"
                      ? "bg-negative/15 text-negative"
                      : "bg-surface-raised text-ink-secondary")
                  }
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={
                    "flex-1 rounded-md py-2 text-sm font-medium transition-colors " +
                    (type === "income"
                      ? "bg-positive/15 text-positive"
                      : "bg-surface-raised text-ink-secondary")
                  }
                >
                  Ingreso
                </button>
                {speechSupported && (
                  <button
                    type="button"
                    onClick={startListening}
                    aria-label="Registrar por voz"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-raised text-lg"
                  >
                    🎙️
                  </button>
                )}
              </div>

              <CurrencyInput
                name="amount"
                required
                value={amount}
                onValueChange={setAmount}
                className="w-full rounded-md border py-3 pl-7 pr-3 text-lg tabular-nums"
              />

              <input
                type="text"
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Descripción (ej. Hamburguesa)"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              {filteredCategories.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-ink-muted">Categoría</p>
                  <div className="flex flex-wrap gap-1.5">
                    {filteredCategories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setCategoryId(categoryId === c.id ? "" : c.id)
                        }
                        className={
                          "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors " +
                          (categoryId === c.id
                            ? "border-brand bg-brand-soft"
                            : "border-border text-ink-secondary")
                        }
                      >
                        <span aria-hidden="true">{c.icon ?? "🏷️"}</span>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-xs text-ink-muted">Etiquetas</p>
                <TagPicker availableTags={tags} compact />
              </div>

              <HouseholdSelect households={households} />

              {state.error && (
                <p className="text-sm text-negative feedback-enter" role="alert">
                  {state.error}
                </p>
              )}

              <button type="submit" disabled={pending} className={buttonClasses.primary}>
                {pending ? "Guardando…" : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {listening && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#e6a5b8] px-6 py-16 feedback-enter"
          role="dialog"
          aria-label="Escuchando"
        >
          <p className="text-sm font-medium text-white/80">Escuchando…</p>

          <div className="relative flex h-32 w-32 items-center justify-center">
            <span className="pulse-ring absolute inset-0 rounded-full bg-white/40" />
            <span
              className="pulse-ring absolute inset-0 rounded-full bg-white/40"
              style={{ animationDelay: "0.6s" }}
            />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl">
              🎙️
            </span>
          </div>

          <div className="w-full max-w-sm space-y-6 text-center">
            <p className="min-h-16 text-xl font-medium leading-snug text-white">
              {liveTranscript || "Di algo como “gasté 25 mil en comida”"}
            </p>
            <button
              type="button"
              onClick={cancelListening}
              className="min-h-11 rounded-full bg-white/20 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
            >
              Detener
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Tipado mínimo de Web Speech API (no incluido en lib.dom.d.ts estándar).
interface SpeechRecognitionResultEventLike {
  results: {
    length: number;
    [index: number]: { isFinal: boolean; [index: number]: { transcript: string } };
  };
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: () => void;
  onresult: (event: SpeechRecognitionResultEventLike) => void;
}
