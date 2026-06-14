# Rifas App — Plataforma de rifas online

Panel admin + vista pública con selección de números y datos de pago (Mercado Pago / transferencia).

## Stack

| Capa        | Tecnología                              |
| ----------- | --------------------------------------- |
| Framework   | Next.js 16 + Turbopack                  |
| UI          | Tailwind CSS 4 + Shadcn/ui              |
| DB          | Neon (PostgreSQL serverless)            |
| ORM         | Drizzle ORM                             |
| Auth        | JWT custom (jose)                       |
| Deploy      | Vercel (recomendado)                    |

## Requisitos

- Node.js 20+
- Una cuenta gratuita en [Neon](https://neon.tech)

## Setup local

```bash
# 1. Clonar
git clone git@github.com:damianArgote/rifas-app.git
cd rifas-app

# 2. Instalar dependencias
npm install

# 3. Crear .env (copiar y completar)
cp .env.example .env
```

### 4. Base de datos (Neon)

1. Creá un proyecto en [Neon Console](https://console.neon.tech)
2. En la pestaña **Dashboard** copiá la **Connection string** (Pooled o Direct, ambas funcionan)
3. Pegala en `.env` como `DATABASE_URL`

La connection string tiene esta pinta:

```
DATABASE_URL="postgresql://usuario:password@ep-algo-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Importante**: agregá `?sslmode=require` al final si no viene.

```bash
# 4. Aplicar schema a la DB
npx drizzle-kit push

# 5. (Opcional) Ver el schema generado
npx drizzle-kit studio
```

### 5. Variables de entorno restantes

```bash
# Generar una secret key para JWT
openssl rand -base64 32
# -> Copiar el resultado a AUTH_SECRET en .env
```

| Variable          | Descripción                                   |
| ----------------- | --------------------------------------------- |
| `DATABASE_URL`    | Connection string de Neon                     |
| `AUTH_SECRET`     | Clave para firmar JWT (generar con openssl)   |
| `ADMIN_EMAIL`     | Email del admin para login                    |
| `ADMIN_PASSWORD`  | Password del admin para login                 |
| `MP_ALIAS`        | Alias de Mercado Pago (se puede editar luego) |
| `MP_CBU`          | CBU/CVU para transferencia                    |
| `MP_TITULAR`      | Nombre del titular de la cuenta               |
| `ADMIN_WHATSAPP`  | WhatsApp del admin (con código país)          |

### 6. Sembrar admin (primera vez)

La DB arranca vacía. Hay dos opciones para crear el admin:

**Opción A — Seed script** (recomendado):

Creá `src/lib/db/seed.ts`:

```ts
import "dotenv/config";
import { db } from "./index";
import { settings } from "./schema";

const defaults = [
  { key: "admin_email", value: process.env.ADMIN_EMAIL || "admin@rifas.app" },
  { key: "admin_password", value: process.env.ADMIN_PASSWORD || "change-me" },
  { key: "mp_alias", value: process.env.MP_ALIAS || "" },
  { key: "mp_cbu", value: process.env.MP_CBU || "" },
  { key: "mp_titular", value: process.env.MP_TITULAR || "" },
  { key: "admin_whatsapp", value: process.env.ADMIN_WHATSAPP || "" },
];

for (const s of defaults) {
  await db.insert(settings).values(s).onConflictDoNothing();
}

console.log("✅ Settings seeded");
process.exit(0);
```

Ejecutalo con:

```bash
npx tsx src/lib/db/seed.ts
```

**Opción B — Login → Configuración**: iniciá sesión en `/admin/login` con las credenciales de `.env`, luego andá a `/admin/configuracion` y completá los datos desde la UI.

### 7. Iniciar dev

```bash
npm run dev
# Abrir http://localhost:3000
```

## Rutas principales

| Ruta                      | Descripción                   |
| ------------------------- | ----------------------------- |
| `/`                       | Home — últimas rifas activas  |
| `/rifa/[id]`              | Vista pública de una rifa     |
| `/admin/login`            | Login del panel admin         |
| `/admin`                  | Dashboard — lista de rifas    |
| `/admin/rifas/nueva`      | Crear una rifa                |
| `/admin/rifas/[id]`       | Detalle + elegir ganador      |
| `/admin/configuracion`    | Config (MP, WhatsApp, etc.)   |

## Scripts disponibles

```bash
npm run dev       # Dev server con Turbopack
npm run build     # Build production
npm run start     # Servir build
npm run lint      # ESLint
npx drizzle-kit push   # Sincronizar schema a DB
npx drizzle-kit studio # Drizzle Studio (UI para ver datos)
```
