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

- [ ] Tabla `categories` (nombre, color/ícono, tipo ingreso/gasto, usuario)
- [ ] Tabla `tags` (nombre, usuario)
- [ ] Tabla `transactions` (tipo, monto, fecha, categoría, etiquetas, nota, usuario)
- [ ] Tabla `debts` (nombre, monto total, saldo pendiente, fecha límite, usuario)
- [ ] Tabla `savings_goals` (nombre, meta, monto actual, plazo, usuario)
- [ ] Tabla `alerts` (tipo, condición, estado, usuario)
- [ ] Tabla `ai_usage_logs` (usuario, tokens in/out, costo estimado, fecha, endpoint)
- [ ] RLS en todas las tablas anteriores

## Fase 3 — Registro de transacciones

- [ ] Formulario manual de transacción (texto): monto, tipo, categoría, etiquetas, nota
- [ ] Entrada por voz: captura con Web Speech API (reconocimiento nativo del navegador)
- [ ] Endpoint server-side que envía el texto (manual o transcrito) a GPT-5.6 Luna
- [ ] Parseo de la respuesta IA → creación automática de transacción (tipo, monto, categoría sugerida, etiquetas sugeridas)
- [ ] Pantalla de confirmación/edición antes de guardar (el usuario puede corregir lo que la IA interpretó)
- [ ] Registro de uso de tokens por cada llamada IA en `ai_usage_logs`
- [ ] Detección/pegado automático (o botón "Pegar imagen") de imagen del portapapeles al abrir la app
- [ ] Endpoint server-side que envía la imagen a GPT-5.6 Luna (visión) para identificar monto, comercio/motivo y fecha del gasto
- [ ] Pantalla de confirmación/edición para el gasto detectado por imagen (misma UX que texto/voz)

## Fase 4 — Categorías y etiquetas

- [ ] CRUD de categorías (crear, editar, eliminar, elegir color/ícono)
- [ ] CRUD de etiquetas
- [ ] Asignar categoría y etiquetas al crear/editar una transacción
- [ ] Filtrar listado de transacciones por categoría/etiqueta

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

## Notas abiertas / pendientes de decidir

- Confirmar el identificador exacto de modelo para llamadas a la API de
  OpenAI correspondiente a "GPT-5.6 Luna" (ver `CLAUDE.md`).
- Evaluar soporte real de Web Speech API en Safari/iOS en PWA instalada
  (puede tener limitaciones respecto a Safari en pestaña normal); tener plan
  B si no funciona bien en modo standalone.
- Validar si Safari/iOS permite leer el portapapeles automáticamente al
  abrir la PWA o si requiere un gesto explícito del usuario (botón "Pegar
  imagen"); ajustar UX según la limitación real encontrada.
