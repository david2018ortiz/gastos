"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { quickAddTransaction } from "@/app/(app)/transactions/actions";
import type { QuickAddState } from "@/app/(app)/transactions/actions";
import { buttonClasses } from "@/components/button-styles";

type Category = { id: string; name: string; icon: string | null; type: string };

const initialState: QuickAddState = { error: null, success: false };

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

export function QuickAddTransaction({ categories }: { categories: Category[] }) {
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
  const [speechSupported, setSpeechSupported] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    );
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => amountInputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setAmount("");
      setCategoryId("");
      setNote("");
      setType("expense");
    }
  }, [state.success]);

  function startListening() {
    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "es-CO";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: SpeechRecognitionResultEventLike) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      const parsed = parseSpeech(transcript, categories);
      setAmount(parsed.amount);
      setType(parsed.type as "expense" | "income");
      setCategoryId(parsed.categoryId);
      setNote(parsed.note);
    };

    recognition.start();
  }

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-brand-ink shadow-lg transition-transform active:scale-95"
        aria-label="Agregar transacción rápido"
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-t-2xl bg-surface p-5 pb-8 feedback-enter"
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
              <input type="hidden" name="note" value={note} />

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
                    className={
                      "flex h-10 w-10 items-center justify-center rounded-full text-lg " +
                      (listening ? "animate-pulse bg-brand text-brand-ink" : "bg-surface-raised")
                    }
                  >
                    🎙️
                  </button>
                )}
              </div>

              <input
                ref={amountInputRef}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                required
                placeholder="Monto"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md border px-3 py-3 text-lg"
                name="amount"
              />

              {listening && (
                <p className="text-xs text-brand-strong feedback-enter">
                  Escuchando…
                </p>
              )}
              {note && !listening && (
                <p className="text-xs text-ink-muted feedback-enter">“{note}”</p>
              )}

              {filteredCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
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
                          : "border-border")
                      }
                    >
                      <span aria-hidden="true">{c.icon ?? "🏷️"}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

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
    </>
  );
}

// Tipado mínimo de Web Speech API (no incluido en lib.dom.d.ts estándar).
interface SpeechRecognitionResultEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: () => void;
  onresult: (event: SpeechRecognitionResultEventLike) => void;
}
