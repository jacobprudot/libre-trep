import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Crear partidos políticos de Honduras
  console.log('📊 Creando partidos políticos...')

  const parties = [
    { code: 'LIBRE', name: 'Partido Libertad y Refundación', color: '#DC2626', order: 1 },
    { code: 'PN', name: 'Partido Nacional', color: '#1E40AF', order: 2 },
    { code: 'PL', name: 'Partido Liberal', color: '#EF4444', order: 3 },
    { code: 'PINU', name: 'Partido Innovación y Unidad', color: '#16A34A', order: 4 },
    { code: 'DC', name: 'Democracia Cristiana', color: '#F59E0B', order: 5 },
  ]

  for (const party of parties) {
    await prisma.party.upsert({
      where: { code: party.code },
      update: {},
      create: party,
    })
  }
  console.log(`✅ ${parties.length} partidos creados`)

  // 2. Crear departamentos de Honduras
  console.log('📍 Creando departamentos...')

  const departments = [
    { code: 'ATL', name: 'Atlántida' },
    { code: 'CHO', name: 'Choluteca' },
    { code: 'COL', name: 'Colón' },
    { code: 'COM', name: 'Comayagua' },
    { code: 'COP', name: 'Copán' },
    { code: 'COR', name: 'Cortés' },
    { code: 'EP', name: 'El Paraíso' },
    { code: 'FM', name: 'Francisco Morazán' },
    { code: 'GD', name: 'Gracias a Dios' },
    { code: 'INT', name: 'Intibucá' },
    { code: 'IB', name: 'Islas de la Bahía' },
    { code: 'LP', name: 'La Paz' },
    { code: 'LEM', name: 'Lempira' },
    { code: 'OCO', name: 'Ocotepeque' },
    { code: 'OLA', name: 'Olancho' },
    { code: 'SB', name: 'Santa Bárbara' },
    { code: 'VAL', name: 'Valle' },
    { code: 'YOR', name: 'Yoro' },
  ]

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    })
  }
  console.log(`✅ ${departments.length} departamentos creados`)

  // 3. Crear 20 delegados de prueba
  console.log('👥 Creando delegados de prueba...')

  const testDelegates = [
    { dni: '0801199001234', fullName: 'Juan Carlos Pérez López', phone: '98765432', qrCode: 'QR-TEST-001', validGPS: true },
    { dni: '0801199001235', fullName: 'María Fernanda García Ruiz', phone: '98765433', qrCode: 'QR-TEST-002', validGPS: true },
    { dni: '0801199001236', fullName: 'Carlos Alberto Martínez Cruz', phone: '98765434', qrCode: 'QR-TEST-003', validGPS: true },
    { dni: '0801199001237', fullName: 'Ana Isabel Rodríguez Flores', phone: '98765435', qrCode: 'QR-TEST-004', validGPS: true },
    { dni: '0801199001238', fullName: 'Roberto José Hernández Soto', phone: '98765436', qrCode: 'QR-TEST-005', validGPS: true },
    { dni: '0801199001239', fullName: 'Laura Patricia Gómez Díaz', phone: '98765437', qrCode: 'QR-TEST-006', validGPS: true },
    { dni: '0801199001240', fullName: 'Diego Alejandro López Vargas', phone: '98765438', qrCode: 'QR-TEST-007', validGPS: true },
    { dni: '0801199001241', fullName: 'Sofía Valentina Ramírez Castro', phone: '98765439', qrCode: 'QR-TEST-008', validGPS: true },
    { dni: '0801199001242', fullName: 'Fernando Miguel Torres Ortiz', phone: '98765440', qrCode: 'QR-TEST-009', validGPS: true },
    { dni: '0801199001243', fullName: 'Gabriela Andrea Morales Pérez', phone: '98765441', qrCode: 'QR-TEST-010', validGPS: true },
    { dni: '0801199001244', fullName: 'Luis Eduardo Flores Gutiérrez', phone: '98765442', qrCode: 'QR-TEST-011', validGPS: true },
    { dni: '0801199001245', fullName: 'Carolina Beatriz Sánchez Romero', phone: '98765443', qrCode: 'QR-TEST-012', validGPS: true },
    { dni: '0801199001246', fullName: 'Javier Antonio Castillo Mejía', phone: '98765444', qrCode: 'QR-TEST-013', validGPS: true },
    { dni: '0801199001247', fullName: 'Daniela Nicole Rivera Silva', phone: '98765445', qrCode: 'QR-TEST-014', validGPS: true },
    { dni: '0801199001248', fullName: 'Andrés Felipe Mendoza Luna', phone: '98765446', qrCode: 'QR-TEST-015', validGPS: true },
    { dni: '0801199001249', fullName: 'Valeria Alejandra Herrera Ramos', phone: '98765447', qrCode: 'QR-TEST-016', validGPS: true },
    { dni: '0801199001250', fullName: 'Ricardo Enrique Núñez Vega', phone: '98765448', qrCode: 'QR-TEST-017', validGPS: true },
    { dni: '0801199001251', fullName: 'Natalia Fernanda Aguilar Campos', phone: '98765449', qrCode: 'QR-TEST-018', validGPS: true },
    // 🚫 2 delegados con GPS INVÁLIDO (>50km de Tegucigalpa)
    { dni: '0801199001252', fullName: 'Sebastián David Medina Rojas - GPS LEJANO', phone: '98765450', qrCode: 'QR-TEST-019', validGPS: false },
    { dni: '0801199001253', fullName: 'Isabella María Jiménez Santos - GPS LEJANO', phone: '98765451', qrCode: 'QR-TEST-020', validGPS: false },
  ]

  // Coordenadas de prueba (Tegucigalpa como base)
  const baseLatitude = 14.0723
  const baseLongitude = -87.1921

  for (const delegate of testDelegates) {
    let latitude: number
    let longitude: number

    if (delegate.validGPS) {
      // GPS válido: cerca de Tegucigalpa (variar ligeramente)
      const randomOffset = Math.random() * 0.01 - 0.005
      latitude = baseLatitude + randomOffset
      longitude = baseLongitude + randomOffset
    } else {
      // GPS inválido: >50km de distancia
      // San Pedro Sula está a ~180km de Tegucigalpa
      latitude = 15.5000 // San Pedro Sula aprox
      longitude = -88.0333
    }

    await prisma.delegate.upsert({
      where: { dni: delegate.dni },
      update: {},
      create: {
        dni: delegate.dni,
        fullName: delegate.fullName,
        phone: delegate.phone,
        qrCode: delegate.qrCode,
        latitude,
        longitude,
        deviceInfo: { browser: 'Test', os: 'Test', validGPS: delegate.validGPS },
      },
    })
  }
  console.log(`✅ ${testDelegates.length} delegados de prueba creados`)
  console.log(`   - 18 con GPS válido (cerca de Tegucigalpa)`)
  console.log(`   - 2 con GPS inválido (>50km - San Pedro Sula)`)

  // 4. Crear algunos centros de votación de prueba
  console.log('🏫 Creando centros de votación de prueba...')

  const fmDept = await prisma.department.findUnique({ where: { code: 'FM' } })

  if (fmDept) {
    // Crear municipio de Tegucigalpa
    const tegucigalpa = await prisma.municipality.upsert({
      where: { code: 'FM-TGU' },
      update: {},
      create: {
        code: 'FM-TGU',
        name: 'Tegucigalpa',
        departmentId: fmDept.id,
      },
    })

    // Crear 5 centros de votación de prueba
    const votingCenters = [
      { code: 'CV-001', name: 'Escuela República de México', address: 'Barrio Guanacaste, Tegucigalpa', latitude: 14.0823, longitude: -87.2021, voters: 500 },
      { code: 'CV-002', name: 'Instituto Central Vicente Cáceres', address: 'Centro Histórico, Tegucigalpa', latitude: 14.0923, longitude: -87.1921, voters: 800 },
      { code: 'CV-003', name: 'Escuela República de Costa Rica', address: 'Col. Kennedy, Tegucigalpa', latitude: 14.0623, longitude: -87.1821, voters: 600 },
      { code: 'CV-004', name: 'Colegio San Francisco', address: 'Barrio La Plazuela, Tegucigalpa', latitude: 14.0723, longitude: -87.2121, voters: 450 },
      { code: 'CV-005', name: 'Instituto Técnico Honduras', address: 'Col. Miraflores, Tegucigalpa', latitude: 14.0523, longitude: -87.1721, voters: 700 },
    ]

    for (const center of votingCenters) {
      await prisma.votingCenter.upsert({
        where: { code: center.code },
        update: {},
        create: {
          code: center.code,
          name: center.name,
          address: center.address,
          latitude: center.latitude,
          longitude: center.longitude,
          departmentId: fmDept.id,
          municipalityId: tegucigalpa.id,
          registeredVoters: center.voters,
        },
      })
    }
    console.log(`✅ ${votingCenters.length} centros de votación creados`)

    // 4.5. Crear JRVs para cada centro
    console.log('🗳️  Creando JRVs de prueba...')

    // Crear 3 JRVs para CV-001 (para testing)
    const centerCV001 = await prisma.votingCenter.findUnique({ where: { code: 'CV-001' } })

    if (centerCV001) {
      const jrvs = [
        { code: 'JRV-CV001-001', members: 5 },
        { code: 'JRV-CV001-002', members: 5 },
        { code: 'JRV-CV001-003', members: 5 },
      ]

      for (const jrv of jrvs) {
        await prisma.jRV.upsert({
          where: { code: jrv.code },
          update: {},
          create: {
            code: jrv.code,
            centerId: centerCV001.id,
            members: jrv.members,
          },
        })
      }

      // Actualizar contador de JRVs en el centro
      await prisma.votingCenter.update({
        where: { id: centerCV001.id },
        data: { jrvCount: jrvs.length },
      })

      console.log(`✅ ${jrvs.length} JRVs creadas para CV-001`)
    }

    // 5. Asignar centros a los delegados de prueba
    console.log('📍 Asignando centros a delegados...')

    if (centerCV001) {
      // Asignar todos los delegados con GPS válido al centro CV-001
      await prisma.delegate.updateMany({
        where: {
          dni: {
            in: [
              '0801199001234', '0801199001235', '0801199001236', '0801199001237',
              '0801199001238', '0801199001239', '0801199001240', '0801199001241',
              '0801199001242', '0801199001243', '0801199001244', '0801199001245',
              '0801199001246', '0801199001247', '0801199001248', '0801199001249',
              '0801199001250', '0801199001251',
            ],
          },
        },
        data: {
          centerId: centerCV001.id,
        },
      })

      console.log(`✅ Delegados asignados al centro ${centerCV001.name}`)
    }
  }

  console.log('✨ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
