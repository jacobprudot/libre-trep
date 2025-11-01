# LibreTrep - Sistema de Conteo Rápido Electoral

**Progressive Web App para Conteo Rápido Electoral**
Partido Libre - Honduras 2025

## 🎯 Descripción

LibreTrep es un sistema PWA diseñado para procesar 6,300 actas electorales presidenciales en una ventana de 4 horas (18:00-22:00) el día de las elecciones generales, proporcionando resultados preliminares en tiempo real.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL 16 con PostGIS
- **ORM**: Prisma
- **Authentication**: DNI + QR + GPS + Phone
- **PWA**: next-pwa
- **OCR**: Tesseract.js + Google Cloud Vision
- **Forms**: React Hook Form + Zod

## 📋 Requisitos

- Node.js 20+
- PostgreSQL 16+
- npm 11+

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales.

### 3. Configurar base de datos

```bash
# Crear base de datos
createdb libretrep

# Ejecutar migraciones
npx prisma migrate dev --name init

# Generar Prisma Client
npx prisma generate
```

### 4. Iniciar desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
libre-trep/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   ├── hooks/                  # Custom hooks
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
└── public/                     # Static assets
```

## 🔑 Autenticación

- DNI (cédula) + QR Code
- GPS validation
- Phone verification
- JWT tokens

## 📱 Flujo de Conteo

1. Login con DNI + QR + GPS
2. Capturar foto acta presidencial
3. Digitar votos (5 partidos)
4. OCR automático
5. Dashboard en tiempo real

## 🚀 Scripts

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Producción
npx prisma studio    # DB GUI
```

## 👥 Equipo

Proyecto del Partido Libre Honduras

---

**Estado**: 🚧 En desarrollo
**Fecha límite**: Nov 30, 2025
