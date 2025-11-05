# Datos de Prueba CNE - LibreTrep

## ⚠️ IMPORTANTE - Formato CNE Oficial

Este documento contiene datos de prueba usando el **formato CNE oficial** con QRs cifrados según especificaciones técnicas del Consejo Nacional Electoral.

### Estructura QR CNE
- **12 dígitos**: `[AA][BBBBB][CC][D][EE]`
  - AA: Código Partido (01-05)
  - BBBBB: Número JRV (00001-99999)
  - CC: Tipo Documento (17=JRV, 18=CIE)
  - D: Movimiento (siempre "1" para EG2025)
  - EE: Código Cargo (01-17)
- **Cifrado**: AES-256-CBC en Base64
- **Llaves**: Mock para desarrollo, reales del CNE en producción

---

## 📱 Delegados de Prueba (GPS Válido - Tegucigalpa)

### Delegado 1 - Presidente JRV LIBRE
```json
{
  "nombre": "Juan Carlos Pérez López",
  "dni": "0801199001234",
  "telefono": "98765432",
  "qrCifrado": "+tPWVDp9oObJngFFrJrEjw==",
  "qrDescifrado": "020000117101",
  "partido": "Partido Libertad y Refundación (LIBRE)",
  "jrv": "00001",
  "cargo": "Presidente Propietario",
  "tipo": "MIEMBRO DE JRV",
  "puedeVotar": true,
  "restriccionHoraria": "1:00PM",
  "gps": {
    "latitud": 14.0723,
    "longitud": -87.1921,
    "valido": true,
    "ubicacion": "Tegucigalpa"
  }
}
```

### Delegado 2 - Secretario JRV LIBRE
```json
{
  "nombre": "María Fernanda García Ruiz",
  "dni": "0801199001235",
  "telefono": "98765433",
  "qrCifrado": "yh/6lNv7xHEcfuVjJEK2rA==",
  "qrDescifrado": "020000117103",
  "partido": "Partido Libertad y Refundación (LIBRE)",
  "jrv": "00001",
  "cargo": "Secretario Propietario",
  "tipo": "MIEMBRO DE JRV",
  "puedeVotar": true,
  "restriccionHoraria": "1:00PM",
  "gps": {
    "latitud": 14.0723,
    "longitud": -87.1921,
    "valido": true,
    "ubicacion": "Tegucigalpa"
  }
}
```

### Delegado 3 - Presidente JRV Partido Nacional
```json
{
  "nombre": "Fernando Miguel Torres Ortiz",
  "dni": "0801199001242",
  "telefono": "98765440",
  "qrCifrado": "bvyfSe2+ra7eM6r+MfWEkA==",
  "qrDescifrado": "050000517101",
  "partido": "Partido Nacional de Honduras (PNH)",
  "jrv": "00005",
  "cargo": "Presidente Propietario",
  "tipo": "MIEMBRO DE JRV",
  "puedeVotar": true,
  "restriccionHoraria": "1:00PM",
  "gps": {
    "latitud": 14.0723,
    "longitud": -87.1921,
    "valido": true,
    "ubicacion": "Tegucigalpa"
  }
}
```

### Delegado 4 - Custodio Informático Electoral (CIE)
```json
{
  "nombre": "Ricardo Enrique Núñez Vega",
  "dni": "0801199001250",
  "telefono": "98765448",
  "qrCifrado": "qQNmg8iVMXylJXi+Z0G7sQ==",
  "qrDescifrado": "020000918115",
  "partido": "Partido Libertad y Refundación (LIBRE)",
  "jrv": "00009",
  "cargo": "Custodio Informático Electoral - 1",
  "tipo": "CIE",
  "puedeVotar": true,
  "restriccionHoraria": "1:00PM",
  "gps": {
    "latitud": 14.0723,
    "longitud": -87.1921,
    "valido": true,
    "ubicacion": "Tegucigalpa"
  }
}
```

---

## 🚫 Delegados con GPS Inválido (Testing de Validación)

### Delegado 5 - GPS Lejano (San Pedro Sula)
```json
{
  "nombre": "Sebastián David Medina Rojas",
  "dni": "0801199001252",
  "telefono": "98765450",
  "qrCifrado": "CT0yW9TJRBwKF9rCptjV/A==",
  "qrDescifrado": "020001017101",
  "partido": "Partido Libertad y Refundación (LIBRE)",
  "jrv": "00010",
  "cargo": "Presidente Propietario",
  "tipo": "MIEMBRO DE JRV",
  "puedeVotar": true,
  "restriccionHoraria": "1:00PM",
  "gps": {
    "latitud": 15.5000,
    "longitud": -88.0333,
    "valido": false,
    "ubicacion": "San Pedro Sula (>180km de Tegucigalpa)",
    "error": "GPS fuera del radio permitido (50km)"
  }
}
```

---

## 🎨 Partidos Políticos (Códigos CNE Oficiales)

| Código | Sigla | Nombre Completo | Color |
|--------|-------|-----------------|-------|
| 01 | DC | Partido Demócrata Cristiano | #F59E0B (Amarillo) |
| 02 | LIBRE | Partido Libertad y Refundación | #DC2626 (Rojo) |
| 03 | PINU | Partido Innovación y Unidad Social Demócrata | #16A34A (Verde) |
| 04 | PLH | Partido Liberal de Honduras | #EF4444 (Rojo) |
| 05 | PNH | Partido Nacional de Honduras | #1E40AF (Azul) |

---

## 📋 Cargos JRV (Códigos CNE)

### Miembros de JRV (Código 17)
| Código | Cargo | Tipo |
|--------|-------|------|
| 01 | Presidente Propietario | MIEMBRO DE JRV |
| 02 | Presidente Suplente | MIEMBRO DE JRV |
| 03 | Secretario Propietario | MIEMBRO DE JRV |
| 04 | Secretario Suplente | MIEMBRO DE JRV |
| 05 | Escrutador Propietario | MIEMBRO DE JRV |
| 06 | Escrutador Suplente | MIEMBRO DE JRV |
| 07-14 | Vocales I-IV (Propietarios y Suplentes) | MIEMBRO DE JRV |

### Custodios Informáticos Electorales (Código 18)
| Código | Cargo | Tipo |
|--------|-------|------|
| 15 | Custodio Informático Electoral - 1 | CIE |
| 16 | Custodio Informático Electoral - 2 | CIE |
| 17 | Custodio Informático Electoral - 3 | CIE |

**Todos los cargos tienen:**
- ✅ Derecho a voto: Sí
- ⏰ Restricción horaria: 1:00PM

---

## 🌍 GPS - Coordenadas de Prueba

### Tegucigalpa (Centro de referencia)
```
Latitud: 14.0723
Longitud: -87.1921
Radio permitido: 50 km
```

### San Pedro Sula (Fuera de rango - Test negativo)
```
Latitud: 15.5000
Longitud: -88.0333
Distancia de Tegucigalpa: ~180 km
Resultado esperado: ❌ Rechazo por GPS
```

---

## 🧪 Flujo de Prueba Completo

### 1. Login con QR CNE

#### Test Exitoso (Delegado 1)
```javascript
POST /api/auth/login
{
  "qrCode": "+tPWVDp9oObJngFFrJrEjw==",
  "dni": "0801199001234",
  "phone": "98765432",
  "latitude": 14.0723,
  "longitude": -87.1921,
  "deviceInfo": {
    "browser": "Chrome Mobile",
    "os": "Android 13"
  }
}

// Respuesta esperada
{
  "success": true,
  "token": "eyJ...",
  "delegate": {
    "id": "clxyz...",
    "fullName": "Juan Carlos Pérez López",
    "dni": "0801199001234",
    "phone": "98765432",
    "partido": "Partido Libertad y Refundación",
    "partidoSigla": "LIBRE",
    "jrv": "1",
    "cargo": "Presidente Propietario",
    "cargoTipo": "MIEMBRO DE JRV",
    "puedeVotar": true,
    "restriccionHoraria": "1:00PM",
    "center": {
      "id": "...",
      "name": "Escuela República de México",
      "code": "CV-001"
    }
  },
  "message": "Autenticación exitosa"
}
```

#### Test Fallido - QR Inválido
```javascript
POST /api/auth/login
{
  "qrCode": "QR_INVALIDO_XYZ==",
  "dni": "0801199001234",
  "phone": "98765432",
  "latitude": 14.0723,
  "longitude": -87.1921
}

// Respuesta esperada
{
  "error": "Código QR inválido o no se pudo descifrar. Verifica tu credencial."
}
```

#### Test Fallido - GPS Lejano
```javascript
POST /api/auth/login
{
  "qrCode": "CT0yW9TJRBwKF9rCptjV/A==",
  "dni": "0801199001252",
  "phone": "98765450",
  "latitude": 15.5000,  // San Pedro Sula
  "longitude": -88.0333
}

// Respuesta esperada
{
  "error": "Tu ubicación está muy lejos de tu centro de votación (180.3 km). Debes estar a máximo 50 km.",
  "distance": 180.3,
  "maxDistance": 50
}
```

---

## 🔐 Encriptación QR

### Variables de Entorno Requeridas

```env
# QR CODE ENCRYPTION (CNE Official)
# IMPORTANTE: Estas llaves son MOCK para desarrollo
# Las llaves reales serán proporcionadas por Smartmatic/CNE

# Llave de cifrado AES-256 (32 bytes en Base64)
QR_ENCRYPTION_KEY="Vk1mtK1YwWZMxpHHKZNoJ8Mv5sB/57sNoDYKMPk97Do="

# Vector de inicialización (16 bytes en Base64)
QR_ENCRYPTION_IV="UkXnuzeTy+gGVBRiG899UQ=="
```

### ⚠️ IMPORTANTE
- Las llaves actuales son **MOCK** solo para desarrollo
- Las llaves **REALES** llegarán del CNE días antes de la elección
- Solo se necesita actualizar estas 2 variables de entorno
- **NO** cambiar código, solo env vars

---

## 🛠️ Comandos de Desarrollo

### Generar nuevos QRs de prueba
```bash
npx tsx scripts/generate-test-qrs.ts
```

### Poblar base de datos con datos CNE
```bash
npx prisma db seed
```

### Ver datos en Prisma Studio
```bash
npx prisma studio
```

### Verificar estructura de datos
```bash
# Verificar delegados
psql -d libretrep -c "SELECT dni, \"qrCodeEncrypted\", \"partyCode\", \"jrvNumber\", \"cargoCode\", \"cargoName\" FROM delegates LIMIT 5;"

# Verificar partidos
psql -d libretrep -c "SELECT code, \"cneCode\", \"shortName\", name FROM parties;"

# Verificar cargos JRV
psql -d libretrep -c "SELECT code, name, type FROM cargos_jrv ORDER BY code;"
```

---

## 📚 Referencias

- **Especificaciones CNE**: `Especificaciones técnicas del código QR en la credencial de cargos de JRV - EG2025 (1).pdf`
- **Librería crypto**: `src/lib/qr-crypto.ts`
- **API Login**: `src/app/api/auth/login/route.ts`
- **Schema Prisma**: `prisma/schema.prisma`
- **Seed**: `prisma/seed.ts`

---

## ✅ Checklist de Testing

- [ ] Login exitoso con QR cifrado válido
- [ ] Rechazo de QR inválido o corrupto
- [ ] Validación GPS dentro de 50km
- [ ] Rechazo GPS fuera de rango
- [ ] Validación DNI (13 dígitos)
- [ ] Validación teléfono (8 dígitos)
- [ ] Información de partido correcta en respuesta
- [ ] Información de cargo correcta en respuesta
- [ ] Audit log creado correctamente
- [ ] Token generado válido
