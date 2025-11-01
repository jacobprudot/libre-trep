# Pre-Deployment Checklist - LibreTrep

## Estado Actual del Proyecto ✅

### Archivos Críticos Presentes
- ✅ `.gitignore` - Configurado correctamente
- ✅ `README.md` - Completo y descriptivo
- ✅ `.env.example` - Template de variables
- ✅ `package.json` - Dependencias completas
- ✅ Prisma schema - Configurado

### Archivos a Revisar
- ⚠️ `.env` - **TIENE CREDENCIALES REALES** (PASSWORD EXPUESTA)
- ⚠️ PowerShell scripts - Scripts de desarrollo

---

## 🔴 CRÍTICO - Resolver ANTES de Git Push

### 1. Credenciales Expuestas en .env
**ARCHIVO**: `.env` línea 2
```
DATABASE_URL="postgresql://postgres:cf8946211ce34639b5f280cdd4dc195e@localhost:5432/libretrep"
```
**PROBLEMA**: Password `cf8946211ce34639b5f280cdd4dc195e` está en el archivo
**ACCIÓN**:
1. Verificar que `.env` está en `.gitignore` ✅ (Ya está)
2. **NUNCA** hacer commit de `.env`
3. Para Vercel: Usar sus variables de entorno UI

### 2. Crear Prisma Singleton
**PROBLEMA**: Múltiples instancias de PrismaClient causan agotamiento de conexiones
**ARCHIVO A CREAR**: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**ARCHIVOS A ACTUALIZAR**:
- `src/app/api/auth/login/route.ts` - línea 5
- `src/app/api/auth/send-sms/route.ts` - si usa Prisma
- `src/app/api/actas/route.ts` - si usa Prisma
- `src/app/api/actas/additional/route.ts` - si usa Prisma
- `src/app/api/actas/check-presidential/route.ts` - si usa Prisma
- `src/app/api/jrvs/route.ts` - si usa Prisma

Cambiar de:
```typescript
const prisma = new PrismaClient();
```
A:
```typescript
import { prisma } from '@/lib/prisma';
```

Y ELIMINAR el `await prisma.$disconnect()` de finally blocks.

### 3. Seguridad en Upload Route
**ARCHIVO**: `src/app/api/upload/route.ts`
**PROBLEMAS**:
- Sin validación de tipo de archivo
- Sin validación de tamaño
- Sin sanitización de filename

**SOLUCIÓN**: Agregar validaciones al inicio:
```typescript
// Validar tipo de archivo
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
if (!allowedTypes.includes(file.type)) {
  return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
}

// Validar tamaño (5MB)
const MAX_SIZE = 5 * 1024 * 1024;
if (file.size > MAX_SIZE) {
  return NextResponse.json({ error: 'Archivo demasiado grande (máx 5MB)' }, { status: 400 });
}

// Sanitizar filename
const sanitizedJrvId = jrvId.replace(/[^a-zA-Z0-9-]/g, '');
const timestamp = Date.now();
const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
const fileName = `acta_${sanitizedJrvId}_${timestamp}.${extension}`;
```

### 4. Fix N+1 Query en Vote Creation
**ARCHIVO**: `src/app/api/actas/route.ts` línea ~125-137
**PROBLEMA**: Loop con await dentro
**SOLUCIÓN**: Usar `createMany`:

```typescript
// ANTES (malo):
for (const record of voteRecords) {
  const partyId = partyMap[record.partyCode];
  if (partyId) {
    await prisma.vote.create({
      data: { actaId: acta.id, partyId, votes: record.votes, source: 'MANUAL' },
    });
  }
}

// DESPUÉS (bueno):
const votesToCreate = voteRecords
  .filter(r => partyMap[r.partyCode])
  .map(r => ({
    actaId: acta.id,
    partyId: partyMap[r.partyCode],
    votes: r.votes,
    source: 'MANUAL' as const,
  }));

await prisma.vote.createMany({
  data: votesToCreate,
});
```

---

## 🟡 IMPORTANTE - Resolver en Deploy

### 5. Variables de Entorno para Vercel
Crear estas variables en Vercel UI:

```bash
# Database (Supabase te dará esta URL)
DATABASE_URL="postgresql://..."

# JWT Secret (generar nuevo)
JWT_SECRET="[GENERAR CON: openssl rand -base64 32]"

# App
NEXT_PUBLIC_APP_URL="https://tu-app.vercel.app"
NODE_ENV="production"

# GPS
GPS_RADIUS_METERS="50000"

# SMS (dejar en mock para demo)
TWILIO_ENABLED="false"

# Upload
UPLOAD_MAX_SIZE="5242880"
```

### 6. Configurar next.config.js/mjs
Verificar que existe y tiene configuración correcta para production.

### 7. Actualizar package.json scripts
Ya están bien configurados ✅

---

## 🟢 RECOMENDACIONES - Mejorar Después

### 8. Crear Error Boundaries
**ARCHIVO A CREAR**: `src/app/error.tsx`
```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={() => reset()}>Intentar nuevamente</button>
    </div>
  );
}
```

### 9. Crear Loading States
**ARCHIVO A CREAR**: `src/app/loading.tsx`

### 10. Agregar Sentry (Opcional)
Para tracking de errores en producción.

---

## 📝 Archivos que NO deben ir a Git

### Ya protegidos en .gitignore ✅
- `node_modules/`
- `.next/`
- `.env*` (todos los archivos .env)
- `*.log`
- `.DS_Store`

### Archivos de desarrollo (ya son seguros)
- `*.ps1` scripts - OK, no tienen credenciales
- `DATOS_PRUEBA.md` - OK, datos ficticios
- `PLAN_DEPLOYMENT.md` - OK, documentación

---

## 🔨 Pasos para Preparar el Código

### Paso 1: Crear Prisma Singleton
```bash
# Crear archivo
New-Item -Path "src/lib/prisma.ts" -ItemType File

# Copiar el código del singleton (ver arriba)
```

### Paso 2: Actualizar API Routes
Buscar y reemplazar en todos los archivos `src/app/api/**/route.ts`:
- Buscar: `const prisma = new PrismaClient()`
- Reemplazar: `import { prisma } from '@/lib/prisma'`
- Eliminar: Líneas con `await prisma.$disconnect()`

### Paso 3: Agregar Validación a Upload
Editar `src/app/api/upload/route.ts` - agregar validaciones al inicio del POST handler.

### Paso 4: Optimizar Vote Creation
Editar `src/app/api/actas/route.ts` - reemplazar loop con `createMany`.

### Paso 5: Verificar Build Local
```bash
npm run build
```

Debe completar sin errores.

---

## ✅ Checklist Final Antes de Git Push

- [ ] `.env` NO está en staging area de git
- [ ] Prisma singleton creado en `src/lib/prisma.ts`
- [ ] Todas las API routes usan el singleton
- [ ] Validación de uploads agregada
- [ ] N+1 query optimizado
- [ ] `npm run build` funciona sin errores
- [ ] Logo en `/public/logo-libre.png` existe ✅
- [ ] No hay credenciales hardcodeadas en código
- [ ] README.md está actualizado ✅
- [ ] .gitignore está configurado ✅

---

## 🚀 Checklist de Deployment a Vercel

### Pre-deployment
- [ ] Crear cuenta en Supabase
- [ ] Crear proyecto PostgreSQL en Supabase
- [ ] Copiar `DATABASE_URL` de Supabase
- [ ] Ejecutar migraciones en Supabase DB
- [ ] Ejecutar seed en Supabase DB

### Deployment
- [ ] Push código a GitHub
- [ ] Crear proyecto en Vercel
- [ ] Conectar repo de GitHub
- [ ] Configurar variables de entorno en Vercel
- [ ] Deploy

### Post-deployment
- [ ] Verificar que el build fue exitoso
- [ ] Probar login desde celular
- [ ] Verificar conexión a base de datos
- [ ] Probar captura de foto
- [ ] Verificar que uploads funcionan

---

## 🐛 Problemas Conocidos (No Críticos)

### Console.logs en Producción
Hay varios `console.log` en el código. No son críticos pero deberían removerse para producción limpia.

**Archivos**:
- `src/app/login/page.tsx` - línea 30
- `src/app/dashboard/capture-acta/page.tsx` - línea 445
- Varios más

**Solución**: Buscar y remover o reemplazar con logger adecuado.

### TODO Comments
Hay TODOs pendientes para calcular hash de imágenes:
- `src/app/api/actas/route.ts:90`
- `src/app/api/actas/additional/route.ts:93`

**Acción**: Documentar como deuda técnica, no bloquea deployment.

---

## 🎯 Prioridades por Fase

### Fase 1: AHORA (Antes de Git Push) - 30 minutos
1. Crear Prisma singleton
2. Actualizar API routes
3. Agregar validación de uploads
4. Fix N+1 query
5. Verificar build

### Fase 2: Durante Deploy - 45 minutos
1. Configurar Supabase
2. Push a GitHub
3. Configurar Vercel
4. Deploy
5. Testing en celular

### Fase 3: Post-Deploy - Después
1. Remover console.logs
2. Agregar error boundaries
3. Implementar TODOs
4. Agregar monitoring

---

## 📞 Soporte

Si algo falla durante deployment:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**ESTADO**: 🟡 Listo para preparación
**TIEMPO ESTIMADO**: 30 minutos de fixes + 45 minutos de deploy = 1.5 horas total
**BLOQUEADORES**: Ninguno crítico, pero los 4 items CRÍTICOS deben resolverse primero.
