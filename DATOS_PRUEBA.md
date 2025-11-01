# Datos de Prueba - LibreTrep

## Delegados de Prueba

### Delegado 1 - Francisco Morazán
```
QR Code: DEL-FM-001-2025
DNI: 0801199012345
Teléfono: 98765432
Nombre: Juan Carlos López
Centro: Escuela República de Honduras
Código Centro: FM-001
Departamento: Francisco Morazán
Municipio: Tegucigalpa
JRV: JRV-001, JRV-002
```

### Delegado 2 - Cortés
```
QR Code: DEL-CT-002-2025
DNI: 0501198523456
Teléfono: 87654321
Nombre: María Elena Reyes
Centro: Instituto Central Vicente Cáceres
Código Centro: CT-002
Departamento: Cortés
Municipio: San Pedro Sula
JRV: JRV-003, JRV-004
```

### Delegado 3 - Atlántida
```
QR Code: DEL-AT-003-2025
DNI: 0301197034567
Teléfono: 76543210
Nombre: Roberto Flores García
Centro: Centro Básico La Ceiba
Código Centro: AT-003
Departamento: Atlántida
Municipio: La Ceiba
JRV: JRV-005
```

## Estructura de JRV

### JRV-001 (Centro FM-001)
```json
{
  "id": "jrv-001",
  "code": "JRV-001",
  "centerId": "fm-001",
  "members": 5,
  "voters": 350
}
```

### JRV-002 (Centro FM-001)
```json
{
  "id": "jrv-002",
  "code": "JRV-002",
  "centerId": "fm-001",
  "members": 5,
  "voters": 420
}
```

## Datos de Votación de Prueba

### Acta Presidencial - Ejemplo
```json
{
  "jrvId": "jrv-001",
  "qrCode": "QR-PRES-JRV001-20251101",
  "totals": {
    "totalVoters": 350,
    "validBallots": 320,
    "blankVotes": 15,
    "nullVotes": 10
  },
  "voteRecords": [
    {
      "partyCode": "DC",
      "partyName": "Democracia Cristiana",
      "votes": 45
    },
    {
      "partyCode": "LIBRE",
      "partyName": "Partido Libre",
      "votes": 165
    },
    {
      "partyCode": "PINU",
      "partyName": "PINU-SD",
      "votes": 35
    },
    {
      "partyCode": "PLH",
      "partyName": "Partido Liberal",
      "votes": 40
    },
    {
      "partyCode": "PNH",
      "partyName": "Partido Nacional",
      "votes": 35
    }
  ]
}
```

### Acta de Diputados - Ejemplo
```json
{
  "type": "deputies",
  "jrvId": "jrv-001",
  "qrCode": "QR-DIP-JRV001-FM-20251101",
  "department": "Francisco Morazán"
}
```

### Acta de Alcaldes - Ejemplo
```json
{
  "type": "mayors",
  "jrvId": "jrv-001",
  "qrCode": "QR-ALC-JRV001-TEGU-20251101",
  "municipality": "Tegucigalpa"
}
```

## GPS - Coordenadas de Prueba

### Tegucigalpa (Francisco Morazán)
```
Latitud: 14.0723
Longitud: -87.1921
```

### San Pedro Sula (Cortés)
```
Latitud: 15.5047
Longitud: -88.0250
```

### La Ceiba (Atlántida)
```
Latitud: 15.7597
Longitud: -86.7967
```

## Códigos SMS de Prueba

En desarrollo, puedes usar estos códigos de verificación:
```
Código universal de prueba: 123456
```

## Tokens de Autenticación

### Estructura del Token
```json
{
  "delegateId": "del-001",
  "dni": "0801199012345",
  "exp": 1730505600000,
  "iat": 1730419200000
}
```

### Token de Ejemplo (Base64)
```
eyJkZWxlZ2F0ZUlkIjoiZGVsLTAwMSIsImRuaSI6IjA4MDExOTkwMTIzNDUiLCJleHAiOjE3MzA1MDU2MDAwMDAsImlhdCI6MTczMDQxOTIwMDAwMH0=
```

## LocalStorage - Estructura de Datos

### auth_token
```
Token JWT en formato Base64
```

### delegate_info
```json
{
  "id": "del-001",
  "fullName": "Juan Carlos López",
  "dni": "0801199012345",
  "phone": "98765432",
  "center": {
    "id": "fm-001",
    "name": "Escuela República de Honduras",
    "code": "FM-001"
  }
}
```

## Partidos Políticos

### Orden de Partidos (según ley electoral)
1. **DC** - Democracia Cristiana (Amarillo)
2. **LIBRE** - Partido Libre (Rojo)
3. **PINU** - PINU-SD (Verde)
4. **PLH** - Partido Liberal (Rojo/Blanco)
5. **PNH** - Partido Nacional (Azul)

## Notas Importantes

1. **Validación de DNI**: Debe tener exactamente 13 dígitos
2. **Validación de Teléfono**: Debe tener exactamente 8 dígitos
3. **GPS**: El sistema valida que estés dentro de un radio de 500m del centro asignado
4. **Orden de Actas**: Primero se debe completar el acta PRESIDENTIAL antes de poder capturar DEPUTIES o MAYORS
5. **Una Acta por JRV**: Solo se permite una acta de cada tipo por JRV

## Flujo de Prueba Completo

### 1. Login
```
IMPORTANTE: Todos los datos deben coincidir exactamente con un delegado en la base de datos.

1. Escanear QR: DEL-FM-001-2025
2. Ingresar DNI: 0801199012345
3. Ingresar Teléfono: 98765432
4. Código SMS: 123456 (en desarrollo)
5. Permitir GPS (usar coordenadas de Tegucigalpa)

NOTA: El sistema valida que QR + DNI + Teléfono coincidan exactamente con un delegado registrado.
Si alguno no coincide, mostrará error de credenciales incorrectas.
```

### 2. Captura Acta Presidencial
```
1. Seleccionar JRV: JRV-001
2. Escanear QR del acta: QR-PRES-JRV001-20251101
3. Fotografiar acta
4. Digitación de votos:
   - Total votantes: 350
   - Papeletas válidas: 320
   - Votos en blanco: 15
   - Votos nulos: 10
   - DC: 45
   - LIBRE: 165
   - PINU: 35
   - PLH: 40
   - PNH: 35
5. Confirmar y enviar
```

### 3. Captura Acta de Diputados
```
1. Seleccionar "Capturar Acta de Diputados"
2. Seleccionar JRV: JRV-001
3. Escanear QR: QR-DIP-JRV001-FM-20251101
4. Fotografiar acta
5. Confirmar y enviar
```

### 4. Captura Acta de Alcaldes
```
1. Seleccionar "Capturar Acta de Alcaldes"
2. Seleccionar JRV: JRV-001
3. Escanear QR: QR-ALC-JRV001-TEGU-20251101
4. Fotografiar acta
5. Confirmar y enviar
```

## Variables de Entorno para Desarrollo

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/libretrep"

# SMS (Twilio o similar)
SMS_PROVIDER="mock" # usar "mock" en desarrollo
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+15005550006"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"

# GPS Validation
GPS_RADIUS_METERS=500

# Upload
UPLOAD_MAX_SIZE_MB=10
```

## Comandos de Desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev
```

### Generar cliente Prisma
```bash
npx prisma generate
```

### Ver base de datos
```bash
npx prisma studio
```

### Ejecutar migraciones
```bash
npx prisma migrate dev
```

### Seed de datos de prueba
```bash
npx prisma db seed
```
