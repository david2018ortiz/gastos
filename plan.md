# Plan de desarrollo — Walley

Checklist de avance del MVP. Ver reglas y decisiones fijas en `CLAUDE.md`.

## Fase 0 — Configuración inicial

- [x] Inicializar repo git y proyecto Next.js (TypeScript, App Router)
- [x] Configurar Tailwind CSS
- [x] Crear proyecto en Supabase (Auth + Postgres) — se reutiliza el proyecto
      existente "gastos" (id `deohllgitkpgburfckoa`) por límite de proyectos
      gratuitos, en vez de crear uno nuevo
- [x] Definir variables de entorno (`.env.local`) y `.gitignore`
- [x] Configurar cliente Supabase (browser + server)
- [x] Configurar manifest.json, iconos y meta tags para instalación PWA en iOS
      (iconos son placeholders de color sólido, pendiente diseño real en Fase 10)
- [x] Configurar service worker básico (offline shell / cache estático)
- [ ] Verificar instalación real en iPhone vía Safari ("Añadir a pantalla de inicio")

## Fase 1 — Autenticación y perfil

- [x] Registro / login con email y contraseña (Supabase Auth)
- [x] Sign in with Apple — código listo (`signInWithOAuth` + callback route);
      falta configurar el proveedor Apple en el dashboard de Supabase con
      credenciales reales de Apple Developer (pendiente, requiere cuenta de
      pago de Apple Developer que el asistente no puede crear)
- [x] Pantalla de perfil: editar nombre, teléfono, edad
- [x] Cambiar contraseña
- [x] Cerrar sesión
- [x] Tabla `profiles` con RLS (cada usuario ve solo lo suyo)

## Fase 2 — Modelo de datos base

- [x] Tabla `categories` (nombre, color/ícono, tipo ingreso/gasto, usuario)
- [x] Tabla `tags` (nombre, usuario)
- [x] Tabla `transactions` (tipo, monto, fecha, categoría, nota, usuario) +
      tabla `transaction_tags` para la relación muchos-a-muchos con etiquetas
- [x] Tabla `debts` (nombre, monto total, saldo pendiente, fecha límite,
      usuario) + tabla `debt_payments` para abonos (Fase 6)
- [x] Tabla `savings_goals` (nombre, meta, monto actual, plazo, usuario) +
      tabla `savings_contributions` para aportes (Fase 7)
- [x] Tabla `alerts` (tipo, condición, estado, usuario)
- [x] Tabla `ai_usage_logs` (usuario, tokens in/out, costo estimado, fecha, endpoint)
- [x] RLS en todas las tablas anteriores — 0 advertencias de seguridad y
      rendimiento en el linter de Supabase (políticas optimizadas con
      `(select auth.uid())`, todas las FK indexadas)

## Fase 3 — Registro de transacciones

- [x] Formulario manual de transacción (texto): monto, tipo, categoría, etiquetas, nota
      — `/transactions/new` y listado en `/transactions`; crea etiquetas al
      vuelo si no existen. Probado extremo a extremo contra la API real de
      Supabase (categoría, transacción, etiqueta, vínculo, listado).
- [ ] Entrada por voz: captura con Web Speech API (reconocimiento nativo del navegador)
- [ ] Endpoint server-side que envía el texto (manual o transcrito) a GPT-5.6 Luna
- [ ] Parseo de la respuesta IA → creación automática de transacción (tipo, monto, categoría sugerida, etiquetas sugeridas)
- [ ] Pantalla de confirmación/edición antes de guardar (el usuario puede corregir lo que la IA interpretó)
- [ ] Registro de uso de tokens por cada llamada IA en `ai_usage_logs`
- [ ] Detección/pegado automático (o botón "Pegar imagen") de imagen del portapapeles al abrir la app
- [ ] Endpoint server-side que envía la imagen a GPT-5.6 Luna (visión) para identificar monto, comercio/motivo y fecha del gasto
- [ ] Pantalla de confirmación/edición para el gasto detectado por imagen (misma UX que texto/voz)

## Fase 4 — Categorías y etiquetas

- [x] CRUD de categorías (crear, editar, eliminar, elegir color/ícono) —
      `/categories`, `/categories/new`, `/categories/[id]/edit`
- [x] CRUD de etiquetas — `/tags` (crear/eliminar inline)
- [x] Asignar categoría y etiquetas al crear/editar una transacción —
      `/transactions/[id]/edit` reutiliza el formulario de creación
- [x] Filtrar listado de transacciones por categoría/etiqueta — selects en
      `/transactions`

Probado extremo a extremo contra la API real: crear/editar categoría con
color e ícono, crear etiqueta y vincularla, filtrar por categoría, y
confirmar que borrar una categoría no rompe sus transacciones (quedan con
`category_id = null` por el `ON DELETE SET NULL` ya definido en la Fase 2).

## Fase 5 — Vistas de ingresos y gastos

- [ ] Listado de transacciones (paginado o por fecha)
- [ ] Resumen del período (total ingresos, total gastos, balance)
- [ ] Gráfico simple de distribución por categoría
- [ ] Vista mensual/semanal navegable

## Fase 6 — Deudas

- [ ] CRUD de deudas
- [ ] Registrar abonos y actualizar saldo pendiente
- [ ] Vista de progreso de pago por deuda

## Fase 7 — Planes de ahorro

- [ ] CRUD de metas de ahorro
- [ ] Registrar aportes a una meta
- [ ] Vista de progreso (barra/gráfico) por meta

## Fase 8 — Alertas

- [ ] Definir reglas de alerta (ej. gasto supera presupuesto de categoría, deuda próxima a vencer, meta de ahorro estancada)
- [ ] Job/lógica que evalúa alertas activas
- [ ] Centro de notificaciones dentro de la app (badge, listado)

## Fase 9 — Perfil avanzado / consumo de IA

- [ ] Vista de consumo de tokens (histórico, costo acumulado estimado)
- [ ] Filtro de consumo por fecha

## Fase 10 — Diseño y pulido

- [ ] Definir paleta de color y tipografía distintiva del proyecto
- [ ] Animaciones de transición entre pantallas (Framer Motion o similar)
- [ ] Micro-interacciones (feedback al guardar transacción, progreso de metas, etc.)
- [ ] Modo claro/oscuro
- [ ] Revisión de accesibilidad (contraste, tamaños táctiles)
- [ ] Prueba completa en iPhone real como PWA instalada

## Fase 11 — Colaboración / cuentas compartidas (familiar)

Permitir que un usuario invite a otra persona (por email) a compartir en un
solo espacio unificado sus ingresos, gastos, deudas y planes de ahorro (ej.
pareja o familia), en vez de llevarlos por separado. **Sin envío de
correos**: la invitación solo es posible si el email ya corresponde a una
cuenta existente en Walley, y aparece como pendiente dentro de la app (perfil
del invitado / notificación al abrir la app), nunca por email.

- [x] Tabla `households` (espacio compartido: nombre, usuario creador, fecha)
- [x] Tabla `household_members` (usuario, household, rol —owner/member—, fecha
      de ingreso) con RLS: solo miembros del household ven la fila
- [x] Tabla `household_invitations` (household, email invitado, usuario que
      invita, estado —pending/accepted/rejected—, fechas); solo una invitación
      pendiente por household+email a la vez
- [x] Base de datos lista para el flujo de invitación: función
      `invite_to_household(household_id, email)` — solo el creador invita, y
      solo si el email ya tiene cuenta en Walley (si no existe, lanza error
      explícito en vez de encolar nada)
- [x] Base de datos lista para notificación/listado de invitaciones
      pendientes: `household_invitations` filtra por RLS según el email del
      usuario autenticado; falta construir la UI (perfil/badge) en una fase
      de interfaz posterior
- [x] Decisión: NO se soporta invitar a un email sin cuenta (se descartó el
      auto-vínculo al registrarse, para evitar cualquier flujo parecido a
      invitación por correo)
- [x] Funciones `accept_household_invitation` / `decline_household_invitation`
      — al aceptar, crean la membresía y las cuentas quedan relacionadas sin
      perder el histórico personal previo
- [x] Modelo de datos de la Fase 2 (`transactions`, `categories`, `debts`,
      `savings_goals`, `alerts`) migrado: cada fila tiene `household_id`
      opcional (null = personal); políticas RLS actualizadas para permitir
      ver/editar tanto al dueño (`user_id`) como a cualquier miembro del
      household (`is_household_member(household_id)`)
- [ ] Selector en la UI para alternar entre vista "personal" y vista
      "compartida" (household) — pendiente de construir la interfaz
- [x] Gestión de miembros en base de datos: `leave_household` (salir) y
      `remove_household_member` (solo el owner remueve a otros); falta la UI
- [x] Decisión: el creador (owner) no puede salir mientras haya otros
      miembros (debe remover a todos primero o transferir el household);
      las transacciones/deudas/metas que un usuario creó quedan con su
      `user_id` siempre — al salir del household solo se le quita el acceso
      compartido a esas filas, no se pierden ni se reasignan

Probado extremo a extremo por SQL simulando dos usuarios: A crea household,
invita a B (por email existente), B ve la invitación, la acepta, y una
transacción de A con `household_id` es visible para B mientras que una
transacción personal de A (sin `household_id`) no lo es.

## Notas abiertas / pendientes de decidir

- Confirmar el identificador exacto de modelo para llamadas a la API de
  OpenAI correspondiente a "GPT-5.6 Luna" (ver `CLAUDE.md`).
- Evaluar soporte real de Web Speech API en Safari/iOS en PWA instalada
  (puede tener limitaciones respecto a Safari en pestaña normal); tener plan
  B si no funciona bien en modo standalone.
- Validar si Safari/iOS permite leer el portapapeles automáticamente al
  abrir la PWA o si requiere un gesto explícito del usuario (botón "Pegar
  imagen"); ajustar UX según la limitación real encontrada.
- Construir la UI de la Fase 11 (invitar, ver/aceptar/rechazar invitaciones,
  selector personal/compartido, gestión de miembros) cuando se aborden las
  pantallas correspondientes — la base de datos ya está lista.
