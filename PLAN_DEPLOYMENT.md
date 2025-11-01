# Plan de Deployment - LibreTrep

## Fase 1: Preparación del Repositorio GitHub

### 1.1 Crear archivo .gitignore
**Prioridad: ALTA**
```
Archivos a ignorar:
- node_modules/
- .next/
- .env
- .env.local
- *.log
- .DS_Store
- dist/
- build/
- coverage/
```

### 1.2 Crear archivo README.md
**Prioridad: ALTA**
```markdown
Contenido:
- Descripción del proyecto
- Tecnologías utilizadas
- Instrucciones de instalación
- Variables de entorno requeridas
- Comandos principales
- Licencia
```

### 1.3 Limpiar datos sensibles
**Prioridad: CRÍTICA**
```
Revisar y eliminar:
- Credenciales en código
- Tokens hardcodeados
- Datos de prueba sensibles
- Configuraciones locales
```

### 1.4 Crear repositorio en GitHub
**Pasos:**
1. Ir a github.com/new
2. Nombre: `libretrep`
3. Descripción: "Sistema de Conteo Rápido Electoral - Partido Libre Honduras 2025"
4. Privado o Público: **PRIVADO** (por seguridad electoral)
5. No inicializar con README (ya lo tenemos)

### 1.5 Comandos Git iniciales
```bash
cd C:\Users\jprudot\proyectos\libre-trep
git init
git add .
git commit -m "Initial commit: LibreTrep electoral system"
git branch -M main
git remote add origin https://github.com/[tu-usuario]/libretrep.git
git push -u origin main
```

---

## Fase 2: Opciones de Deployment

### Opción A: Vercel (RECOMENDADA para demo rápido)
**⭐ Mejor para: Demo rápido, desarrollo**

**Ventajas:**
- ✅ Deploy en 2 minutos
- ✅ HTTPS automático
- ✅ Funciona perfecto con Next.js
- ✅ CI/CD automático desde GitHub
- ✅ Plan gratuito generoso
- ✅ Edge functions (rápido en LATAM)
- ✅ URLs de preview automáticas
- ✅ Accesible desde celular inmediatamente

**Desventajas:**
- ❌ Necesita base de datos externa
- ❌ Serverless (cold starts)
- ❌ Limitaciones en plan gratuito

**Configuración:**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

**Base de datos:**
- Opción 1: Supabase (PostgreSQL gratis)
- Opción 2: Neon (PostgreSQL serverless)
- Opción 3: Railway (PostgreSQL + storage)

**Costo:** $0/mes (plan gratuito)

---

### Opción B: Railway
**⭐ Mejor para: Demo con base de datos incluida**

**Ventajas:**
- ✅ PostgreSQL incluido (sin configuración extra)
- ✅ Deploy desde GitHub
- ✅ HTTPS automático
- ✅ $5 gratis/mes
- ✅ Variables de entorno fáciles
- ✅ Logs en tiempo real
- ✅ Backups automáticos de DB

**Desventajas:**
- ❌ Después de $5 gratuitos, necesitas tarjeta
- ❌ Más lento que Vercel para frontend

**Configuración:**
```
1. Ir a railway.app
2. "New Project" → "Deploy from GitHub"
3. Seleccionar repo libretrep
4. Railway detecta Next.js automáticamente
5. Agregar PostgreSQL desde "Add Service"
6. Configurar variables de entorno
7. Deploy automático
```

**Costo:** $0-5/mes (plan gratuito con límite)

---

### Opción C: Render
**⭐ Mejor para: Deployment estable a largo plazo**

**Ventajas:**
- ✅ PostgreSQL gratis incluido
- ✅ SSL automático
- ✅ Deploy automático desde GitHub
- ✅ Muy estable
- ✅ Plan gratuito permanente

**Desventajas:**
- ❌ Más lento en plan gratuito (spin down después de inactividad)
- ❌ Cold starts de 30-60 segundos
- ❌ Limitado en plan gratuito

**Configuración:**
```
1. Ir a render.com
2. "New Web Service"
3. Conectar GitHub repo
4. Build Command: npm install && npx prisma generate && npm run build
5. Start Command: npm start
6. Agregar PostgreSQL desde "New PostgreSQL"
7. Configurar variables de entorno
```

**Costo:** $0/mes (plan gratuito)

---

### Opción D: AWS Amplify + RDS (Producción)
**⭐ Mejor para: Producción real, escalabilidad**

**Ventajas:**
- ✅ Infraestructura robusta
- ✅ Escalabilidad ilimitada
- ✅ Control total
- ✅ Servicios AWS integrados
- ✅ SLA de 99.99%

**Desventajas:**
- ❌ Más complejo de configurar
- ❌ Costo más alto
- ❌ Requiere conocimientos de AWS
- ❌ No ideal para demo rápido

**Costo:** ~$20-50/mes (mínimo)

---

### Opción E: DigitalOcean App Platform
**⭐ Mejor para: Balance precio/features**

**Ventajas:**
- ✅ Precio predecible
- ✅ PostgreSQL managed incluido
- ✅ Buen rendimiento
- ✅ Documentación clara

**Desventajas:**
- ❌ Sin plan gratuito
- ❌ Más caro que Railway/Render

**Costo:** $12/mes (mínimo)

---

## Fase 3: Preparación de Base de Datos

### Opción Recomendada: Supabase (con Vercel)
**Pasos:**
1. Crear cuenta en supabase.com
2. "New Project"
3. Copiar `DATABASE_URL` de Settings → Database
4. Agregar a variables de entorno en Vercel
5. Ejecutar migraciones:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### Opción Alternativa: Neon (PostgreSQL Serverless)
**Pasos:**
1. Crear cuenta en neon.tech
2. "Create Project"
3. Copiar connection string
4. Configurar en Vercel
5. Ejecutar migraciones

---

## Fase 4: Variables de Entorno

### Variables Críticas para Deployment
```env
# Database
DATABASE_URL="postgresql://..."

# JWT Secret (generar nuevo)
JWT_SECRET="[generar con: openssl rand -base64 32]"

# SMS (opcional en demo)
SMS_PROVIDER="mock"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# GPS
GPS_RADIUS_METERS=500

# Upload (usar servicio cloud)
NEXT_PUBLIC_UPLOAD_URL=""
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

# App
NEXT_PUBLIC_APP_URL="https://tu-app.vercel.app"
NODE_ENV="production"
```

---

## Fase 5: Configuración de Uploads (Imágenes de Actas)

### Opción A: UploadThing (RECOMENDADA)
**Ventajas:**
- ✅ Integración perfecta con Next.js
- ✅ 2GB gratis/mes
- ✅ CDN incluido
- ✅ Muy fácil de configurar

**Pasos:**
1. Crear cuenta en uploadthing.com
2. Crear app
3. Copiar API keys
4. Instalar: `npm install uploadthing @uploadthing/react`
5. Configurar en código

### Opción B: Cloudinary
**Ventajas:**
- ✅ 25GB gratis/mes
- ✅ Optimización automática de imágenes
- ✅ Muy establecido

---

## Fase 6: Deployment Paso a Paso (Vercel + Supabase)

### 6.1 Preparar el código
```bash
# 1. Crear .env.example (sin valores sensibles)
cp .env .env.example

# 2. Editar .env.example y remover valores
# Dejar solo las llaves sin valores

# 3. Commit cambios
git add .
git commit -m "feat: prepare for deployment"
git push origin main
```

### 6.2 Configurar Supabase
```
1. Ir a supabase.com → New Project
2. Nombre: libretrep
3. Database Password: [generar seguro]
4. Region: South America (más cercano a Honduras)
5. Esperar ~2 minutos
6. Settings → Database → Connection string → URI
7. Copiar DATABASE_URL
```

### 6.3 Ejecutar Migraciones
```bash
# Localmente con DATABASE_URL de Supabase
npx prisma db push
npx prisma generate
npx prisma db seed
```

### 6.4 Deploy a Vercel
```bash
# Opción 1: CLI
vercel --prod

# Opción 2: Dashboard
# 1. Ir a vercel.com → New Project
# 2. Import from GitHub → libretrep
# 3. Configure variables de entorno
# 4. Deploy
```

### 6.5 Configurar Variables en Vercel
```
Settings → Environment Variables:
- DATABASE_URL: [de Supabase]
- JWT_SECRET: [generar nuevo]
- NEXT_PUBLIC_APP_URL: [URL de Vercel]
- GPS_RADIUS_METERS: 500
- SMS_PROVIDER: mock
```

### 6.6 Configurar Dominio (Opcional)
```
Si tienes dominio:
1. Vercel → Settings → Domains
2. Agregar dominio personalizado
3. Configurar DNS según instrucciones
```

---

## Fase 7: Testing en Celular

### 7.1 Acceso Inmediato
```
1. Deploy completo en Vercel
2. Vercel te da URL: https://libretrep-xxx.vercel.app
3. Abrir en celular → Agregar a pantalla de inicio
4. Funciona como PWA
```

### 7.2 Testing Local en Red Local (Opcional)
```bash
# 1. Obtener IP local
ipconfig
# Buscar IPv4 Address: 192.168.X.X

# 2. Ejecutar dev server
npm run dev

# 3. Acceder desde celular en misma WiFi
http://192.168.X.X:3000
```

### 7.3 Tunnel con Ngrok (Para testing antes de deploy)
```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Ejecutar app local
npm run dev

# 3. En otra terminal, crear tunnel
ngrok http 3000

# 4. Ngrok te da URL pública
# Ejemplo: https://abc123.ngrok.io

# 5. Abrir en celular
```

---

## Fase 8: Monitoreo y Logs

### 8.1 Vercel Dashboard
```
- Ver deploys en tiempo real
- Logs de errores
- Analytics de performance
- Uso de recursos
```

### 8.2 Sentry (Opcional - Tracking de Errores)
```bash
npm install @sentry/nextjs

# Configurar en next.config.js
# Plan gratuito: 5,000 errores/mes
```

---

## Fase 9: CI/CD Automático

### 9.1 GitHub Actions (Opcional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build
      - run: npx prisma generate
```

### 9.2 Vercel Auto-Deploy
```
Por defecto, Vercel hace deploy automático cuando:
- Push a main → Deploy a producción
- Pull Request → Deploy preview
```

---

## Fase 10: Seguridad

### 10.1 Rate Limiting
```typescript
// Agregar en API routes
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
})
```

### 10.2 CORS
```typescript
// Ya configurado en Next.js
// Verificar headers en next.config.js
```

### 10.3 Helmet (Security Headers)
```bash
npm install helmet
```

---

## Plan Recomendado: DEMO RÁPIDO (1-2 horas)

### ✅ Stack Recomendado:
- **Frontend/Backend:** Vercel
- **Base de Datos:** Supabase (PostgreSQL)
- **Uploads:** UploadThing
- **Monitoring:** Vercel Analytics (incluido)

### Pasos Resumidos:
```
1. [15 min] Crear .gitignore, README, limpiar código
2. [5 min]  Crear repo en GitHub y push
3. [10 min] Crear proyecto en Supabase
4. [10 min] Ejecutar migraciones y seed
5. [5 min]  Crear cuenta Vercel
6. [10 min] Deploy a Vercel con variables de entorno
7. [5 min]  Configurar UploadThing
8. [10 min] Testing en celular
9. [10 min] Ajustes finales

Total: ~80 minutos
```

### Costo Total: $0/mes
- Vercel: Gratis
- Supabase: Gratis (500MB DB, 2GB transfer)
- UploadThing: Gratis (2GB uploads)

---

## Plan Alternativo: PRODUCCIÓN (3-5 horas)

### ✅ Stack Recomendado:
- **Frontend/Backend:** Railway
- **Base de Datos:** Railway PostgreSQL
- **Uploads:** Cloudinary
- **Monitoring:** Sentry

### Pasos:
```
1. [20 min] Preparar código y GitHub
2. [15 min] Configurar Railway
3. [20 min] Agregar PostgreSQL
4. [15 min] Migraciones y seed
5. [15 min] Configurar Cloudinary
6. [30 min] Variables de entorno y secrets
7. [20 min] Deploy y testing
8. [30 min] Configurar dominio
9. [30 min] Setup Sentry y monitoring
10. [30 min] Testing completo

Total: ~3.5 horas
```

### Costo Total: $5-12/mes
- Railway: $0-5/mes (plan gratuito con límite)
- Cloudinary: Gratis
- Sentry: Gratis

---

## Siguiente Paso Inmediato

### Opción 1: Demo Rápido (RECOMENDADO)
```bash
# Ejecutar esto ahora:
1. Crear .gitignore
2. Crear README básico
3. git init && git add . && git commit -m "Initial commit"
4. Crear repo en GitHub
5. git push
6. Ir a vercel.com y hacer deploy
```

### Opción 2: Testing Local Primero
```bash
# Probar en celular sin deploy:
1. npm run dev
2. ngrok http 3000
3. Abrir URL de ngrok en celular
```

---

## Checklist Final Antes de Deploy

- [ ] .gitignore configurado
- [ ] .env no está en git
- [ ] README.md creado
- [ ] Código sin credenciales hardcodeadas
- [ ] package.json tiene scripts correctos
- [ ] Base de datos de prueba funciona
- [ ] Build local exitoso: `npm run build`
- [ ] Migraciones de Prisma funcionan
- [ ] Variables de entorno documentadas
- [ ] Logo e imágenes en /public
- [ ] PWA manifest configurado

---

## Contacto y Soporte

Si tienes dudas durante el deployment:
1. Vercel Docs: vercel.com/docs
2. Supabase Docs: supabase.com/docs
3. Prisma Docs: prisma.io/docs
4. Next.js Docs: nextjs.org/docs

---

## Notas Importantes

⚠️ **SEGURIDAD:**
- NUNCA subir .env a GitHub
- Usar variables de entorno en Vercel/Railway
- Cambiar JWT_SECRET en producción
- Habilitar HTTPS (automático en Vercel)

⚠️ **BASE DE DATOS:**
- Hacer backup antes de migraciones
- Usar DATABASE_URL diferente para dev/prod
- Limite de conexiones en Supabase: 60 (plan gratuito)

⚠️ **PERFORMANCE:**
- Optimizar imágenes antes de subir
- Usar CDN para assets estáticos
- Monitorear uso de Vercel/Supabase

---

**¿Cuál opción prefieres para empezar?**
1. Demo rápido con Vercel + Supabase (80 min, $0)
2. Producción con Railway (3.5 hrs, $5-12/mes)
3. Testing local con ngrok primero (15 min, $0)
