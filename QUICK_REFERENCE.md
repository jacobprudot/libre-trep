# LibreTrep - Quick Reference Card

## 🚀 Estado del Proyecto

**Status**: 🟢 LISTO PARA DEPLOYMENT
**Build**: ✅ Exitoso
**Git**: ✅ 5 commits, working tree limpio
**Siguiente**: Deployment a Railway + Supabase

---

## ⚡ Comandos Esenciales

```bash
# Desarrollo
npm run dev              # http://localhost:3000
npm run build            # Verificar build antes de deploy

# Base de Datos
npx prisma studio        # UI visual de la BD
npx prisma migrate dev   # Crear migración
npx prisma db seed       # Poblar con 6.2M voters

# Git
git status               # Ver cambios
git log --oneline -5     # Últimos commits
```

---

## 📦 Deployment Rápido (Próxima Sesión)

### 1. GitHub (5 min)
```bash
# Crear repo en: https://github.com/new
git remote add origin https://github.com/[USER]/libre-trep.git
git push -u origin master
```

### 2. Supabase PostgreSQL (10 min)
1. Crear cuenta: https://supabase.com
2. New Project → **Europe (Frankfurt)**
3. Copiar `DATABASE_URL` de Settings → Database
4. Ejecutar:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### 3. Railway Deploy (15 min)
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

**Variables requeridas:**
```
DATABASE_URL=[de Supabase]
JWT_SECRET=[openssl rand -base64 32]
NEXT_PUBLIC_APP_URL=https://[app].railway.app
NODE_ENV=production
GPS_RADIUS_METERS=50000
TWILIO_ENABLED=false
```

---

## 🧪 Datos de Prueba

**Delegado 1 (Tegucigalpa)**
- QR: `DEL-FM-001-2025`
- DNI: `0801199012345`
- Tel: `98765432`
- GPS: 14.0723, -87.1921

**Delegado 2 (San Pedro Sula)**
- QR: `DEL-CORTES-001-2025`
- DNI: `0801198523456`
- Tel: `95432167`
- GPS: 15.5036, -88.0253

*Ver `DATOS_PRUEBA.md` para más*

---

## ⚠️ Reglas Críticas

### ✅ SIEMPRE
```typescript
// Usar singleton de Prisma
import { prisma } from '@/lib/prisma';

// Import nombrado de QRScanner
import { QRScanner } from '@/components/qr-scanner';

// Batch inserts
await prisma.vote.createMany({ data: [...] });
```

### ❌ NUNCA
```typescript
// No crear múltiples Prisma clients
const prisma = new PrismaClient(); // ❌

// No import default de QRScanner
import QRScanner from '@/components/qr-scanner'; // ❌

// No loops con await
for (...) { await prisma.vote.create(...) } // ❌

// No desconectar manualmente
await prisma.$disconnect(); // ❌
```

---

## 🐛 Troubleshooting Rápido

**Build falla**
→ Verificar imports de QRScanner (usar `{ QRScanner }`)

**"Too many Prisma Clients"**
→ Usar `import { prisma } from '@/lib/prisma'`

**GPS no funciona**
→ Verificar HTTPS en producción

**Cámara no funciona**
→ Requiere HTTPS (no funciona en HTTP)

**Database error**
→ Verificar `DATABASE_URL` en env vars

---

## 📚 Documentación Completa

| Archivo | Contenido |
|---------|-----------|
| `.claude.md` | Contexto completo del proyecto |
| `PROXIMA_SESION.md` | Plan paso a paso de deployment |
| `DATOS_PRUEBA.md` | Credenciales de testing |
| `PLAN_DEPLOYMENT.md` | Opciones detalladas de deploy |
| `README.md` | Setup y desarrollo local |

---

## 🎯 Checklist Pre-Deploy

- [x] Build exitoso (`npm run build`)
- [x] Commits creados
- [x] .env protegido (.gitignore)
- [x] Documentación completa
- [ ] Repo en GitHub
- [ ] Base de datos en Supabase
- [ ] App desplegada en Railway
- [ ] Testing desde móvil

---

## 🔗 Links Útiles

- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **Cloudflare**: https://cloudflare.com
- **GitHub**: https://github.com

---

## ⏱️ Tiempo Estimado Próxima Sesión

- GitHub: 5 min
- Supabase: 15 min (setup + migraciones)
- Railway: 20 min (deploy + config)
- Testing: 10 min
- **Total: ~50 minutos**

---

**¿Dudas? Consulta `.claude.md` para contexto completo**
