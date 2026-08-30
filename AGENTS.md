# Walley — Reglas y decisiones fijas

Este archivo es la fuente de verdad para decisiones de proyecto que no deben
repetirse en cada conversación. Ver `plan.md` para el checklist de avance.

## Stack

- Next.js (TypeScript, App Router)
- Tailwind CSS
- Supabase (Auth + Postgres, con RLS en todas las tablas de usuario)
- PWA instalable en iOS (manifest.json + service worker básico, sin librerías
  pesadas de PWA salvo que se decida lo contrario)

## Convenciones de código

- Todo el contenido visible para el usuario (UI, mensajes, labels) en español.
- Nombres de variables, funciones, tablas y columnas en inglés/snake_case
  o camelCase según convención de Next.js/Postgres estándar.
- Cliente Supabase separado para browser y server (`lib/supabase/client.ts`,
  `lib/supabase/server.ts`).
- Cada tabla de datos de usuario debe tener RLS activado desde su creación,
  nunca como tarea separada posterior.

## IA — "GPT-5.6 Luna"

- **Pendiente de confirmar**: el identificador exacto de modelo en la API de
  OpenAI que corresponde a este nombre no está confirmado todavía.
- Mientras tanto, usar una variable de entorno `AI_MODEL_ID` (en
  `.env.local`, nunca hardcodeada) como placeholder configurable. Todo el
  código que llama al modelo debe leer este valor de entorno, no un literal.
- Cada llamada a IA (texto o visión) debe registrar tokens in/out y costo
  estimado en `ai_usage_logs` (Fase 3).

## Notas abiertas heredadas de plan.md

- Confirmar identificador real de modelo para "GPT-5.6 Luna".
- Evaluar soporte de Web Speech API en Safari/iOS en modo PWA instalada
  (standalone); tener plan B si falla.
- Validar si Safari/iOS permite leer el portapapeles automáticamente al
  abrir la PWA, o si requiere gesto explícito del usuario (botón "Pegar
  imagen").

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
