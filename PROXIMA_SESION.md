# Plan para Próxima Sesión - Deployment LibreTrep

**Fecha**: En 2 horas
**Estado Actual**: ✅ Código listo, commit creado, build exitoso

---

## 🎯 Objetivos de la Sesión

1. ✅ Crear repositorio en GitHub
2. ✅ Configurar base de datos PostgreSQL (Europa preferiblemente)
3. ✅ Deploy del proyecto
4. ✅ Integrar Cloudflare Turnstile
5. ✅ Testing en móvil

---

## 📋 Checklist Pre-Sesión

### Estado Actual ✅
- [x] Código completo y funcionando
- [x] Build exitoso sin errores
- [x] Prisma singleton implementado
- [x] Upload validation agregada
- [x] N+1 queries optimizados
- [x] Commit creado con mensaje descriptivo
- [x] .gitignore configurado correctamente
- [x] Working tree limpio

### Credenciales a Tener Listas
- [ ] Cuenta GitHub (verificar acceso)
- [ ] Dominio IONOS (si ya lo tienes)
- [ ] Cuenta Cloudflare (crear si no existe)

---

## 🗓️ Agenda de la Sesión (90 minutos)

### **Paso 1: GitHub Repository (10 min)**
```bash
# Crear repo en GitHub: https://github.com/new
# Nombre sugerido: libre-trep-electoral

# Conectar repo local
git remote add origin https://github.com/[TU-USUARIO]/libre-trep-electoral.git
git branch -M master
git push -u origin master
```

### **Paso 2: Base de Datos PostgreSQL (20 min)**

**Opción Recomendada: Supabase (Europa - Frankfurt)**
- ✅ PostgreSQL nativo
- ✅ Región EU (Frankfurt) - GDPR compliant
- ✅ Free tier generoso (500MB, 50K rows)
- ✅ Backups automáticos
- ✅ Connection pooling incluido
- ✅ Dashboard para administración

**Pasos:**
1. Crear cuenta: https://supabase.com
2. Crear proyecto → Región: **Europe (eu-central-1)**
3. Obtener `DATABASE_URL` desde Settings → Database
4. Ejecutar migraciones:
   ```bash
   # Desde local, conectado a Supabase
   npx prisma migrate deploy
   npx prisma db seed
   ```

**Alternativas PostgreSQL Europa:**
- **Neon** (Frankfurt) - Serverless PostgreSQL
- **Railway** (eu-west) - PostgreSQL + Hosting en uno
- **Render** (Frankfurt) - PostgreSQL managed

### **Paso 3: Deployment (30 min)**

**Opción A: Railway (Europea - Recomendada)**
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login y deploy
railway login
railway init
railway up

# Configurar variables de entorno en dashboard
```

**Variables de Entorno a Configurar:**
```env
DATABASE_URL=postgresql://...supabase.co/postgres
JWT_SECRET=[generar nuevo con: openssl rand -base64 32]
NEXT_PUBLIC_APP_URL=https://[tu-app].railway.app
NODE_ENV=production
GPS_RADIUS_METERS=50000
TWILIO_ENABLED=false
```

**Opción B: Vercel (Rápido para demo inicial)**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### **Paso 4: Cloudflare Setup (20 min)**

**4.1 Crear cuenta Cloudflare**
- https://dash.cloudflare.com/sign-up
- Verificar email

**4.2 Configurar Turnstile**
1. Dashboard → Turnstile → Add Site
2. Domain: `[tu-dominio]` o `localhost` para testing
3. Obtener:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`

**4.3 (Opcional) Configurar dominio**
- Si tienes dominio IONOS:
  1. Agregar sitio a Cloudflare
  2. Cambiar nameservers en IONOS
  3. Configurar DNS records

### **Paso 5: Testing (10 min)**

**Checklist de Testing:**
- [ ] Abrir app en navegador de escritorio
- [ ] Abrir app en móvil (escanear QR con URL)
- [ ] Login completo con datos de prueba
- [ ] Capturar acta presidencial
- [ ] Capturar acta adicional
- [ ] Verificar foto upload
- [ ] Verificar GPS validation

**Datos de Prueba:**
- Ver archivo: `DATOS_PRUEBA.md`
- Delegado 1: QR=DEL-FM-001-2025, DNI=0801199012345

---

## 🔧 Comandos Útiles para la Sesión

```bash
# Verificar estado de Git
git status
git log --oneline -5

# Ver ramas remotas
git remote -v

# Build local para verificar
npm run build

# Iniciar dev server
npm run dev

# Ver logs de Prisma
npx prisma studio  # Abre UI para ver BD

# Generar nuevo JWT secret
openssl rand -base64 32
```

---

## 📊 Arquitectura Final Esperada

```
Usuario Móvil (Honduras)
    ↓
Cloudflare CDN (Edge global)
    ↓ [Turnstile Protection]
Dominio: libretrep.com
    ↓
Railway (Europa - Frankfurt)
    ↓ [Next.js App]
Supabase PostgreSQL (Europa - Frankfurt)
    [6.2M votantes + actas]
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: Build falla en deploy
**Solución**: Verificar que todas las env vars estén configuradas
```bash
railway variables  # Ver variables
railway logs       # Ver logs de error
```

### Problema 2: No conecta a base de datos
**Solución**: Verificar DATABASE_URL
```bash
# Probar conexión local
npx prisma db push
```

### Problema 3: GPS no funciona en móvil
**Solución**: Verificar HTTPS (requerido para geolocation API)

### Problema 4: Upload de fotos falla
**Solución**: Verificar permisos de escritura o migrar a S3/Cloudinary

---

## 📝 Notas Importantes

1. **PostgreSQL es obligatorio** - Prisma schema usa tipos específicos de Postgres
2. **HTTPS es obligatorio** - GPS y cámara requieren conexión segura
3. **Región EU preferida** - Mejor latencia para Honduras que US East
4. **Free tiers limitados** - Planear upgrade si crece uso

---

## 🎁 Bonus: Mejoras Post-Deployment

Después de deployment básico, considerar:
- [ ] Configurar dominio personalizado
- [ ] Activar Cloudflare Analytics
- [ ] Configurar alertas de monitoreo
- [ ] Implementar rate limiting
- [ ] Agregar logging estructurado (mejor que console.log)
- [ ] Configurar backups automáticos de BD
- [ ] Implementar CI/CD con GitHub Actions

---

## 📞 Recursos Útiles

- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Cloudflare Turnstile**: https://developers.cloudflare.com/turnstile
- **Next.js Deploy**: https://nextjs.org/docs/deployment
- **Prisma Migrations**: https://www.prisma.io/docs/concepts/components/prisma-migrate

---

## ✅ Resultado Esperado al Final de la Sesión

1. ✅ App desplegada y accesible desde cualquier dispositivo
2. ✅ URL pública funcionando: `https://[tu-app].railway.app`
3. ✅ Base de datos poblada con datos reales
4. ✅ Cloudflare Turnstile activo (opcional para v1)
5. ✅ Testing exitoso desde móvil
6. ✅ Documentación actualizada con URLs de producción

---

**Estado**: 🟢 TODO LISTO PARA DEPLOYMENT

**Próxima sesión**: Enfocada 100% en infraestructura y deploy
**Tiempo estimado**: 90 minutos (puede extenderse a 2 horas con troubleshooting)
