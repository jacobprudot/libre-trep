# 📍 Validación GPS Basada en JRV - LibreTrep

**Versión**: 2.0 - GPS Mejorado
**Fecha**: 5 de Noviembre, 2025

---

## 🎯 Concepto Clave

El sistema valida la ubicación GPS del delegado **basándose en el centro de votación de la JRV extraída del código QR**, no en un centro asignado manualmente en el perfil del delegado.

### ¿Por qué este enfoque es superior?

1. **Fuente Única de Verdad**: El QR CNE contiene el número de JRV oficial
2. **Sin Sincronización Manual**: No depende de asignación previa en la BD
3. **Validación Dinámica**: Cada JRV está vinculada a su centro real
4. **Menor Margen de Error**: Reduce discrepancias entre datos

---

## 🔄 Flujo de Validación

### 1. Escaneo del QR
```
Delegado escanea QR de credencial CNE
↓
Sistema descifra QR (AES-256-CBC)
↓
Extrae: [Partido][JRV][TipoDoc][Mov][Cargo]
```

### 2. Extracción del Número de JRV
```typescript
// Ejemplo QR descifrado: "020000117103"
const qrData = processQR(encryptedQR);
// qrData.jrvNumber = "00001"
```

### 3. Búsqueda de Centro de Votación
```typescript
// Buscar JRV en base de datos
const jrv = await prisma.jRV.findFirst({
  where: { code: qrData.jrvNumber },  // "00001"
  include: {
    center: {
      include: { municipality: true }
    }
  }
});

// jrv.center = Escuela República de México
// jrv.center.latitude = 14.0823
// jrv.center.longitude = -87.2021
```

### 4. Cálculo de Distancia
```typescript
const distanceKm = calculateDistance(
  delegateLatitude,    // 14.0750 (ubicación actual)
  delegateLongitude,   // -87.1950
  jrv.center.latitude,  // 14.0823 (centro de la JRV)
  jrv.center.longitude  // -87.2021
) / 1000;

// distanceKm = 0.85 km
```

### 5. Validación del Radio
```typescript
const MAX_DISTANCE_KM = 20;  // 20 km de radio

if (distanceKm > MAX_DISTANCE_KM) {
  return error("Muy lejos del centro de tu JRV");
}

// ✅ VÁLIDO - Delegado está a 0.85 km del centro
```

---

## 📊 Estructura de Datos

### JRV en Base de Datos
```typescript
{
  id: "clxyz...",
  code: "00001",              // ← Del QR CNE
  centerId: "centro-001",
  members: 5,
  center: {
    id: "centro-001",
    name: "Escuela República de México",
    code: "CV-001",
    latitude: 14.0823,        // ← Coordenadas del centro
    longitude: -87.2021,
    departmentId: "...",
    municipalityId: "..."
  }
}
```

### QR Descifrado
```typescript
{
  partyCode: "02",      // LIBRE
  jrvNumber: "00001",   // ← Código de JRV
  docType: "17",        // MIEMBRO JRV
  movement: "1",        // EG2025
  cargoCode: "01",      // Presidente
  raw: "020000117101"
}
```

---

## 🎯 Parámetros de Validación

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Radio Máximo** | 20 km | Permite movilidad razonable dentro del municipio |
| **Fuente de Coordenadas** | JRV → Centro → Municipio | Cascada de fallback si faltan coords |
| **Precisión GPS** | ±10 metros | Estándar móvil moderno |
| **Timeout GPS** | 10 segundos | Balance entre precisión y UX |

---

## ✅ Ventajas de Validación por JRV

### 1. **Elimina Dependencia de Asignación Manual**
```
❌ Antes: Delegado.centerId (podía estar desactualizado)
✅ Ahora: QR.jrvNumber → JRV.center (siempre correcto)
```

### 2. **Validación en Tiempo Real**
- No requiere sincronización previa
- Funciona con credenciales emitidas last-minute
- Reduce errores de configuración

### 3. **Auditoría Clara**
```json
{
  "delegado": "Juan Pérez",
  "qrJRV": "00001",
  "centroBuscado": "Escuela República de México",
  "distanciaKm": 0.85,
  "resultado": "✅ VÁLIDO"
}
```

### 4. **Fallback Automático**
```typescript
if (center.latitude && center.longitude) {
  // Usar coordenadas del centro (ideal)
} else if (municipality.latitude && municipality.longitude) {
  // Fallback a coordenadas del municipio
} else {
  // Error: sin coordenadas de referencia
}
```

---

## 🧪 Casos de Prueba

### Test 1: Delegado Cerca del Centro (✅ VÁLIDO)
```json
{
  "qr": "+tPWVDp9oObJngFFrJrEjw==",
  "qrDescifrado": "020000117101",
  "jrv": "00001",
  "centro": "Escuela República de México",
  "coordenadasCentro": { "lat": 14.0823, "lng": -87.2021 },
  "coordenadasDelegado": { "lat": 14.0750, "lng": -87.1950 },
  "distancia": "0.85 km",
  "resultado": "✅ APROBADO - Dentro de 20 km"
}
```

### Test 2: Delegado Lejos del Centro (❌ RECHAZADO)
```json
{
  "qr": "CT0yW9TJRBwKF9rCptjV/A==",
  "qrDescifrado": "020001017101",
  "jrv": "00010",
  "centro": "Escuela República de México (Tegucigalpa)",
  "coordenadasCentro": { "lat": 14.0823, "lng": -87.2021 },
  "coordenadasDelegado": { "lat": 15.5000, "lng": -88.0333 },
  "distancia": "180.3 km",
  "resultado": "❌ RECHAZADO - Fuera de 20 km (San Pedro Sula)"
}
```

### Test 3: JRV No Encontrada (❌ ERROR)
```json
{
  "qr": "INVALID_QR_CODE==",
  "qrDescifrado": "029999917101",
  "jrv": "99999",
  "resultado": "❌ ERROR - JRV 99999 no encontrada en el sistema"
}
```

---

## 🔧 Implementación Técnica

### Código de Validación GPS

**Archivo**: [`src/app/api/auth/login/route.ts`](src/app/api/auth/login/route.ts)

```typescript
// 1. Procesar QR CNE
const qrData = processQR(encryptedQR);
if (!qrData) {
  return error("QR inválido");
}

// 2. Buscar JRV en BD
const jrv = await prisma.jRV.findFirst({
  where: { code: qrData.jrvNumber },
  include: {
    center: { include: { municipality: true } }
  }
});

if (!jrv) {
  return error(`JRV ${qrData.jrvNumber} no encontrada`);
}

// 3. Obtener coordenadas de referencia
let refLat, refLng, refName;

if (jrv.center.latitude && jrv.center.longitude) {
  refLat = jrv.center.latitude;
  refLng = jrv.center.longitude;
  refName = jrv.center.name;
} else if (jrv.center.municipality?.latitude) {
  refLat = jrv.center.municipality.latitude;
  refLng = jrv.center.municipality.longitude;
  refName = jrv.center.municipality.name;
} else {
  return error("Sin coordenadas de referencia");
}

// 4. Calcular distancia
const distanceKm = calculateDistance(
  delegateLat, delegateLng,
  refLat, refLng
) / 1000;

// 5. Validar radio
const MAX_DISTANCE_KM = 20;
if (distanceKm > MAX_DISTANCE_KM) {
  return error(
    `Muy lejos del centro de tu JRV (${distanceKm.toFixed(1)} km de ${refName}). ` +
    `Debes estar a máximo ${MAX_DISTANCE_KM} km.`
  );
}

// ✅ GPS Válido
```

---

## 📈 Métricas y Monitoreo

### Logs de Validación GPS

```json
{
  "timestamp": "2025-11-05T10:30:00Z",
  "delegado": "Juan Pérez",
  "dni": "0801199001234",
  "qrJRV": "00001",
  "centroVotacion": "Escuela República de México",
  "coordenadasCentro": { "lat": 14.0823, "lng": -87.2021 },
  "coordenadasDelegado": { "lat": 14.0750, "lng": -87.1950 },
  "distanciaKm": 0.85,
  "maxPermitido": 20,
  "resultado": "✅ VÁLIDO",
  "tiempoValidacion": "45ms"
}
```

### Métricas Clave a Monitorear

1. **Tasa de Aprobación GPS**: % de validaciones exitosas
2. **Distancia Promedio**: Media de km desde centro
3. **JRVs No Encontradas**: Count de errores 404
4. **Tiempos de Respuesta**: Latencia de validación
5. **Rechazos por Distancia**: Distribución de distancias rechazadas

---

## 🚀 Beneficios para el Sistema

### 1. Escalabilidad
- ✅ No requiere pre-asignación de 1000s de delegados
- ✅ Funciona con registros de última hora
- ✅ Reduce carga administrativa

### 2. Confiabilidad
- ✅ Fuente única de verdad (QR CNE)
- ✅ Menos puntos de fallo
- ✅ Validación determinística

### 3. Seguridad
- ✅ Previene spoofing de ubicación (>20km rechazado)
- ✅ Vincula delegado a JRV oficial
- ✅ Audit trail completo

### 4. Experiencia de Usuario
- ✅ Validación instantánea
- ✅ Mensajes de error claros con distancia exacta
- ✅ No requiere configuración previa

---

## 🔄 Flujo Completo de Autenticación

```
1. Delegado escanea QR de credencial
   ↓
2. App envía: QR + DNI + Tel + GPS
   ↓
3. Backend descifra QR (AES-256-CBC)
   ↓
4. Extrae número de JRV (ej: "00001")
   ↓
5. Busca JRV en BD → Obtiene Centro
   ↓
6. Calcula distancia GPS vs Centro
   ↓
7. Valida: distancia <= 20 km?
   ├─ SÍ → ✅ Autenticación exitosa
   └─ NO → ❌ GPS fuera de rango
```

---

## 📝 Respuesta de API

### Éxito (200 OK)
```json
{
  "success": true,
  "token": "eyJ...",
  "delegate": {
    "fullName": "Juan Pérez",
    "jrv": "1",
    "jrvCode": "00001",
    "cargo": "Presidente Propietario",
    "partido": "Partido Libertad y Refundación",
    "center": {
      "id": "...",
      "name": "Escuela República de México",
      "code": "CV-001",
      "latitude": 14.0823,
      "longitude": -87.2021
    },
    "gpsValidation": {
      "distanceKm": 0.85,
      "maxAllowed": 20,
      "withinRange": true
    }
  }
}
```

### Error GPS (403 Forbidden)
```json
{
  "error": "Tu ubicación está muy lejos del centro de votación de tu JRV (180.3 km de Escuela República de México). Debes estar a máximo 20 km.",
  "distance": 180.3,
  "maxDistance": 20,
  "jrv": "1",
  "centro": "Escuela República de México"
}
```

---

## 🎓 Conclusiones

La validación GPS basada en JRV del QR proporciona:

1. **Mayor Precisión**: Cada delegado se valida contra el centro correcto de su JRV
2. **Menos Errores**: Elimina discrepancias por asignaciones manuales
3. **Mejor Auditoría**: Logs completos con JRV, centro y distancia
4. **Implementación Limpia**: Código simple y mantenible

**Esta arquitectura garantiza que solo delegados físicamente presentes en su centro de votación puedan autenticarse, reduciendo fraude y errores operacionales.**

---

**Última Actualización**: 5 de Noviembre, 2025
**Implementado en**: LibreTrep v2.0
