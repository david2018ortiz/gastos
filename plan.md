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
- [x] Cambiar contraseña (estando ya autenticado)
- [x] Recuperar contraseña olvidada — `/forgot-password` (envía enlace por
      email vía `resetPasswordForEmail`) + `/reset-password` (define la
      nueva); no estaba en el plan original, se agregó tras un problema real
      de acceso de un usuario
- [x] Cerrar sesión
- [x] Tabla `profiles` con RLS (cada usuario ve solo lo suyo)
- [x] Confirmación de email automática al registrarse (trigger
      `auto_confirm_email`): por defecto Supabase exige confirmar el correo
      antes de poder iniciar sesión, lo cual bloqueaba a los usuarios sin
      SMTP propio configurado; el trigger confirma el email en el momento
      del registro para que se pueda entrar de inmediato. También se puede
      desactivar el requisito desde Authentication → Providers → Email →
      "Confirm email" en el dashboard de Supabase.

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
- [x] Entrada por voz: captura con Web Speech API (reconocimiento nativo del
      navegador) — botón 🎙️ en el "agregar rápido" del resumen; transcribe y
      hace un parseo heurístico simple (sin IA: extrae el primer número como
      monto, detecta "ingreso" por palabras clave, intenta calzar el nombre
      de una categoría existente en el texto). El usuario ve y corrige el
      resultado antes de guardar. El parseo real con IA sigue bloqueado por
      el modelo pendiente (bullet siguiente).
- [x] "Agregar rápido" fuera del flujo original del plan: botón flotante en
      el resumen (`/dashboard`) para registrar un gasto/ingreso en un par de
      toques sin cambiar de página (`quick-add-transaction.tsx` +
      `quickAddTransaction` en `transactions/actions.ts`)
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

- [x] Listado de transacciones (paginado o por fecha) — hecho en Fase 3/4
      (`/transactions`, filtrable por categoría/etiqueta)
- [x] Resumen del período (total ingresos, total gastos, balance) — `/dashboard`
- [x] Gráfico de distribución por categoría — barras animadas, deslizables
      horizontalmente, con ícono y color por categoría (paleta categórica
      validada del skill de dataviz — CVD-safe, verificada con el validador)
- [x] Vista navegable por día/semana/mes/año — `/dashboard?period=day|week|
      month|year&date=YYYY-MM-DD`, selector tipo segmented control + flechas
      anterior/siguiente que avanzan según el período elegido
- [x] Filtro del resumen por categoría y por etiqueta (además del filtro que
      ya existía en el listado de `/transactions`)
- [x] Íconos de categoría desde una biblioteca interna de emojis
      (`icon-picker.tsx`), ya no texto libre
- [x] Colores por etiqueta: chips con color asignado de forma determinística
      por id (misma paleta, identidad estable entre recargas)
- [x] Menú de navegación persistente (fuera del plan original, pedido por
      confusión real del usuario para llegar al perfil), en un layout
      compartido `(app)/layout.tsx` para todas las páginas autenticadas.
      Primera versión: barra inferior fija con íconos — el usuario no la
      quiso ("la combinación con íconos no es agradable"); reemplazada por
      un **menú desplegable** de solo texto (`nav-menu.tsx`) desde la barra
      superior, junto a la campana de alertas
- [x] Listado de movimientos animado en el resumen, agrupado por fecha y
      respetando el período/categoría/etiqueta filtrados
      (`daily-transaction-list.tsx`) — pedido explícitamente por el usuario
      en vez de que el gráfico de categorías fuera lo único visible
- [x] Formato de moneda colombiana en todos los campos de monto: separador
      de miles con punto, decimales con coma, ícono "$" (`currency-input.tsx`,
      reemplaza los `<input type="number">` sueltos en las 6 formas que
      capturan dinero)
- [x] Overlay de entrada por voz a pantalla completa con animación de
      "escuchando" (anillos pulsantes) y transcripción en vivo, fondo
      `#e6a5b8` / texto blanco — pedido explícitamente por el usuario en
      lugar del indicador pequeño inicial

Probado extremo a extremo: consulta con joins de categorías/etiquetas contra
la API real de Supabase, misma forma de datos que usa `/dashboard`.

## Fase 6 — Deudas

- [x] CRUD de deudas — `/debts`, `/debts/new`, `/debts/[id]/edit`
- [x] Registrar abonos y actualizar saldo pendiente — `/debts/[id]`; el saldo
      se descuenta automáticamente vía trigger de base de datos
      (`apply_debt_payment`, clampa a 0, nunca queda negativo)
- [x] Vista de progreso de pago por deuda — barra animada (mismo patrón que
      el gráfico de la Fase 5), monto pagado/pendiente y porcentaje

Probado extremo a extremo: creación de deuda, dos abonos consecutivos
(incluido uno que sobrepasa el saldo restante) contra la API real de
Supabase, confirmando que el trigger deja `remaining_amount` en 0 sin
error.

## Fase 7 — Planes de ahorro

- [x] CRUD de metas de ahorro — `/savings`, `/savings/new`, `/savings/[id]/edit`
- [x] Registrar aportes a una meta — `/savings/[id]`; el monto actual se
      suma automáticamente vía trigger de base de datos
      (`apply_savings_contribution`, clampa a `target_amount`, nunca lo supera)
- [x] Vista de progreso por meta — barra animada (mismo patrón que deudas,
      color azul para distinguir visualmente de la barra verde de deudas)

Probado extremo a extremo: creación de meta, dos aportes consecutivos
(incluido uno que sobrepasa la meta) contra la API real de Supabase,
confirmando que el trigger deja `current_amount` exactamente en
`target_amount` sin error.

## Fase 8 — Alertas

- [x] Definir reglas de alerta — `/alerts/new`: presupuesto de categoría,
      deuda próxima a vencer, meta de ahorro estancada
- [x] Lógica que evalúa alertas activas — `evaluate-alerts.ts`; **no hay un
      job en segundo plano** (no hay pg_cron/Edge Function desplegado),
      se evalúa "en caliente" cada vez que se visita `/dashboard` o
      `/alerts`, actualizando el `status` de cada alerta en la base de
      datos. Suficiente para el uso normal de la app; si se necesita
      evaluación sin abrir la app (ej. para push notifications) haría
      falta un cron real más adelante.
- [x] Centro de notificaciones dentro de la app — `/alerts` (listado de
      disparadas + reglas configuradas) y badge con contador en `/dashboard`

Probado extremo a extremo: presupuesto superado, deuda por vencer y meta
recién creada (que correctamente NO dispara antes del umbral de días),
verificado con datos reales contra la API de Supabase.

## Fase 9 — Perfil avanzado / consumo de IA

- [ ] Vista de consumo de tokens (histórico, costo acumulado estimado)
- [ ] Filtro de consumo por fecha

## Fase 10 — Diseño y pulido

- [x] Paleta de color y tipografía distintiva — ajustada tres veces por
      feedback directo del usuario: verde de marca inicial (rechazado por
      "contraste alto") → pastel azul grisáceo (rechazado, "quitar ese
      gris") → **verde `#72e3ad`** (elegido explícitamente por el usuario),
      texto oscuro sobre el color en vez de blanco (contraste 12.47:1) +
      tipografía Manrope; tokens centralizados en `globals.css` (`--brand`,
      `--ink`, `--surface`, `--page`, `--border`, `--positive`, `--negative`,
      `--warning`); los colores categóricos del gráfico de la Fase 5 se
      mantienen aparte (identidad de datos, no decoración)
- [x] Animaciones de transición entre pantallas — Framer Motion
      (`PageTransition`, fade + slide sutil), movida al layout `(app)` para
      que la barra de navegación no parpadee en cada cambio de página
- [x] Micro-interacciones — botones con `active:scale-95` y hover, mensajes
      de error/éxito con animación de entrada (`feedback-enter`), barras de
      progreso/gráfico que ya animaban desde la Fase 5/6/7
- [x] Modo claro/oscuro — ajustado tras feedback: **ya no sigue la
      preferencia del sistema operativo** (el usuario no quería oscuro por
      defecto); toggle simple de 2 estados (claro/oscuro) en el perfil,
      claro siempre por defecto, persistido en `localStorage`, sin flash
      gracias a un script inline que aplica el tema antes del primer paint;
      todos los tokens
      tienen su variante oscura
- [x] Revisión de accesibilidad — botones primarios con altura mínima de
      44px (`min-h-11`); contraste verificado por cálculo (WCAG): marca vs.
      blanco 7.34:1, texto secundario 7.53:1, texto muted ajustado de
      3.41:1 a 5.60:1 (AA) tras la revisión, verde/rojo de marca de la
      Fase 5 claros en ambos modos
- [ ] Prueba completa en iPhone real como PWA instalada — pendiente, requiere
      un dispositivo físico (ver Fase 0)
- [x] Portada de bienvenida para visitantes no autenticados en `/` (antes
      redirigía directo a `/login` sin explicar nada) con nombre, descripción
      corta y los 4 puntos principales de la app; textos introductorios
      añadidos también en `/login` y estados vacíos más claros en varias
      pantallas

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
