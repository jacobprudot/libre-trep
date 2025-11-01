# 🔐 Credenciales de Prueba - LibreTrep

Este documento contiene las credenciales de los 20 delegados de prueba creados en el sistema.

## 📋 Delegados con GPS Válido (18)

Estos delegados están ubicados cerca de Tegucigalpa y pasarán la validación GPS (máximo 50km del centro).

| # | DNI | Nombre Completo | Teléfono | QR Code |
|---|-----|-----------------|----------|---------|
| 1 | 0801199001234 | Juan Carlos Pérez López | 98765432 | QR-TEST-001 |
| 2 | 0801199001235 | María Fernanda García Ruiz | 98765433 | QR-TEST-002 |
| 3 | 0801199001236 | Carlos Alberto Martínez Cruz | 98765434 | QR-TEST-003 |
| 4 | 0801199001237 | Ana Isabel Rodríguez Flores | 98765435 | QR-TEST-004 |
| 5 | 0801199001238 | Roberto José Hernández Soto | 98765436 | QR-TEST-005 |
| 6 | 0801199001239 | Laura Patricia Gómez Díaz | 98765437 | QR-TEST-006 |
| 7 | 0801199001240 | Diego Alejandro López Vargas | 98765438 | QR-TEST-007 |
| 8 | 0801199001241 | Sofía Valentina Ramírez Castro | 98765439 | QR-TEST-008 |
| 9 | 0801199001242 | Fernando Miguel Torres Ortiz | 98765440 | QR-TEST-009 |
| 10 | 0801199001243 | Gabriela Andrea Morales Pérez | 98765441 | QR-TEST-010 |
| 11 | 0801199001244 | Luis Eduardo Flores Gutiérrez | 98765442 | QR-TEST-011 |
| 12 | 0801199001245 | Carolina Beatriz Sánchez Romero | 98765443 | QR-TEST-012 |
| 13 | 0801199001246 | Javier Antonio Castillo Mejía | 98765444 | QR-TEST-013 |
| 14 | 0801199001247 | Daniela Nicole Rivera Silva | 98765445 | QR-TEST-014 |
| 15 | 0801199001248 | Andrés Felipe Mendoza Luna | 98765446 | QR-TEST-015 |
| 16 | 0801199001249 | Valeria Alejandra Herrera Ramos | 98765447 | QR-TEST-016 |
| 17 | 0801199001250 | Ricardo Enrique Núñez Vega | 98765448 | QR-TEST-017 |
| 18 | 0801199001251 | Natalia Fernanda Aguilar Campos | 98765449 | QR-TEST-018 |

**Centro Asignado:** Escuela República de México (CV-001)
**Ubicación:** Barrio Guanacaste, Tegucigalpa
**Coordenadas:** 14.0823, -87.2021

---

## ❌ Delegados con GPS Inválido (2)

Estos delegados están ubicados en San Pedro Sula (~180km de Tegucigalpa) y **NO** pasarán la validación GPS.

| # | DNI | Nombre Completo | Teléfono | QR Code |
|---|-----|-----------------|----------|---------|
| 19 | 0801199001252 | Sebastián David Medina Rojas - GPS LEJANO | 98765450 | QR-TEST-019 |
| 20 | 0801199001253 | Isabella María Jiménez Santos - GPS LEJANO | 98765451 | QR-TEST-020 |

**Ubicación:** San Pedro Sula (15.5000, -88.0333)
**Distancia de Tegucigalpa:** ~180 km
**Resultado esperado:** Rechazo por GPS inválido

---

## 🧪 Cómo Probar el Sistema

### Opción 1: Login Exitoso (GPS Válido)

1. Ve a `/login`
2. Escanea o ingresa manualmente el QR: `QR-TEST-001`
3. Ingresa DNI: `0801199001234`
4. Ingresa Teléfono: `98765432`
5. Captura GPS (tu ubicación real)
   - ⚠️ **Importante:** En producción, debes estar cerca de Tegucigalpa
   - En desarrollo, puedes mockear las coordenadas en el código

### Opción 2: Login Fallido (GPS Inválido)

Usa las credenciales de los delegados #19 o #20 para probar el rechazo por GPS.

### Verificación SMS (Modo Desarrollo)

En modo desarrollo (`TWILIO_ENABLED=false`), el código SMS se muestra en:
- Consola del servidor (terminal donde corre `npm run dev`)
- Response del API (campo `mockCode`)

---

## 🗺️ Coordenadas de Referencia

### Tegucigalpa (Base válida)
- **Latitud:** 14.0723
- **Longitud:** -87.1921
- **Radio válido:** 50 km

### San Pedro Sula (Inválida - >50km)
- **Latitud:** 15.5000
- **Longitud:** -88.0333
- **Distancia:** ~180 km de Tegucigalpa

---

## 🔧 Configuración

Para probar con GPS real en tu dispositivo:
1. Asegúrate de que tu navegador tenga permisos de ubicación
2. Usa HTTPS (o localhost en desarrollo)
3. El sistema validará que estés a máximo 50km del centro asignado

Para testing sin GPS:
- Puedes modificar temporalmente el código del API para mockear coordenadas
- O ajustar el `MAX_DISTANCE_KM` en [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts:11)

---

## 📊 Base de Datos

Puedes consultar todos los delegados en la base de datos:

```sql
SELECT
  dni,
  "fullName",
  phone,
  "qrCode",
  latitude,
  longitude
FROM delegates
ORDER BY dni;
```

O ver los centros asignados:

```sql
SELECT
  d.dni,
  d."fullName",
  vc.name as centro,
  vc.code as codigo_centro
FROM delegates d
LEFT JOIN voting_centers vc ON d."centerId" = vc.id
ORDER BY d.dni;
```
