import { PrismaClient } from '@prisma/client'
import { generateMockQR, CARGOS_JRV, PARTIDOS } from '../src/lib/qr-crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Crear partidos políticos de Honduras
  console.log('📊 Creando partidos políticos...')

  const parties = [
    { code: 'LIBRE', cneCode: '02', shortName: 'LIBRE', name: 'Partido Libertad y Refundación', color: '#DC2626', order: 1 },
    { code: 'PNH', cneCode: '05', shortName: 'PNH', name: 'Partido Nacional de Honduras', color: '#1E40AF', order: 2 },
    { code: 'PLH', cneCode: '04', shortName: 'PLH', name: 'Partido Liberal de Honduras', color: '#EF4444', order: 3 },
    { code: 'PINU', cneCode: '03', shortName: 'PINU', name: 'Partido Innovación y Unidad Social Demócrata', color: '#16A34A', order: 4 },
    { code: 'DC', cneCode: '01', shortName: 'DC', name: 'Partido Demócrata Cristiano', color: '#F59E0B', order: 5 },
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

  // 3. Crear catálogo de Cargos JRV (CNE oficial)
  console.log('📋 Creando catálogo de cargos JRV...')

  const cargosData = Object.entries(CARGOS_JRV).map(([code, cargo], index) => ({
    code,
    name: cargo.name,
    type: cargo.type,
    canVote: cargo.canVote,
    timeRestriction: cargo.timeRestriction,
    order: index + 1,
  }))

  for (const cargo of cargosData) {
    await prisma.cargoJRV.upsert({
      where: { code: cargo.code },
      update: {},
      create: cargo,
    })
  }
  console.log(`✅ ${cargosData.length} cargos JRV creados`)

  // 4. Crear 20 delegados de prueba
  console.log('👥 Creando delegados de prueba...')

  // Delegados de prueba con formato CNE
  const testDelegates = [
    { dni: '0801199001234', fullName: 'Juan Carlos Pérez López', phone: '98765432', partyCode: '02', jrvNumber: '00001', docType: '17', cargoCode: '01', validGPS: true },
    { dni: '0801199001235', fullName: 'María Fernanda García Ruiz', phone: '98765433', partyCode: '02', jrvNumber: '00001', docType: '17', cargoCode: '03', validGPS: true },
    { dni: '0801199001236', fullName: 'Carlos Alberto Martínez Cruz', phone: '98765434', partyCode: '02', jrvNumber: '00002', docType: '17', cargoCode: '01', validGPS: true },
    { dni: '0801199001237', fullName: 'Ana Isabel Rodríguez Flores', phone: '98765435', partyCode: '02', jrvNumber: '00002', docType: '17', cargoCode: '03', validGPS: true },
    { dni: '0801199001238', fullName: 'Roberto José Hernández Soto', phone: '98765436', partyCode: '02', jrvNumber: '00003', docType: '17', cargoCode: '01', validGPS: true },
    { dni: '0801199001239', fullName: 'Laura Patricia Gómez Díaz', phone: '98765437', partyCode: '02', jrvNumber: '00003', docType: '17', cargoCode: '03', validGPS: true },
    { dni: '0801199001240', fullName: 'Diego Alejandro López Vargas', phone: '98765438', partyCode: '02', jrvNumber: '00004', docType: '17', cargoCode: '05', validGPS: true },
    { dni: '0801199001241', fullName: 'Sofía Valentina Ramírez Castro', phone: '98765439', partyCode: '02', jrvNumber: '00004', docType: '17', cargoCode: '07', validGPS: true },
    { dni: '0801199001242', fullName: 'Fernando Miguel Torres Ortiz', phone: '98765440', partyCode: '05', jrvNumber: '00005', docType: '17', cargoCode: '01', validGPS: true },
    { dni: '0801199001243', fullName: 'Gabriela Andrea Morales Pérez', phone: '98765441', partyCode: '05', jrvNumber: '00005', docType: '17', cargoCode: '03', validGPS: true },
    { dni: '0801199001244', fullName: 'Luis Eduardo Flores Gutiérrez', phone: '98765442', partyCode: '04', jrvNumber: '00006', docType: '17', cargoCode: '01', validGPS: true },
    { dni: '0801199001245', fullName: 'Carolina Beatriz Sánchez Romero', phone: '98765443', partyCode: '04', jrvNumber: '00006', docType: '17', cargoCode: '03', validGPS: true },
    { dni: '0801199001246', fullName: 'Javier Antonio Castillo Mejía', phone: '98765444', partyCode: '03', jrvNumber: '00007', docType: '17', cargoCode: '01', validGPS: true },
    { dni: '0801199001247', fullName: 'Daniela Nicole Rivera Silva', phone: '98765445', partyCode: '03', jrvNumber: '00007', docType: '17', cargoCode: '03', validGPS: true },
    { dni: '0801199001248', fullName: 'Andrés Felipe Mendoza Luna', phone: '98765446', partyCode: '01', jrvNumber: '00008', docType: '17', cargoCode: '01', validGPS: true },
    { dni: '0801199001249', fullName: 'Valeria Alejandra Herrera Ramos', phone: '98765447', partyCode: '01', jrvNumber: '00008', docType: '17', cargoCode: '03', validGPS: true },
    { dni: '0801199001250', fullName: 'Ricardo Enrique Núñez Vega', phone: '98765448', partyCode: '02', jrvNumber: '00009', docType: '18', cargoCode: '15', validGPS: true },
    { dni: '0801199001251', fullName: 'Natalia Fernanda Aguilar Campos', phone: '98765449', partyCode: '02', jrvNumber: '00009', docType: '18', cargoCode: '16', validGPS: true },
    // 🚫 2 delegados con GPS INVÁLIDO (>50km de Tegucigalpa)
    { dni: '0801199001252', fullName: 'Sebastián David Medina Rojas - GPS LEJANO', phone: '98765450', partyCode: '02', jrvNumber: '00010', docType: '17', cargoCode: '01', validGPS: false },
    { dni: '0801199001253', fullName: 'Isabella María Jiménez Santos - GPS LEJANO', phone: '98765451', partyCode: '05', jrvNumber: '00010', docType: '17', cargoCode: '03', validGPS: false },
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

    // Generar QR cifrado con formato CNE
    const qrCodeEncrypted = generateMockQR({
      partyCode: delegate.partyCode,
      jrvNumber: delegate.jrvNumber,
      docType: delegate.docType,
      cargoCode: delegate.cargoCode,
    })

    // Obtener información del cargo
    const cargo = CARGOS_JRV[delegate.cargoCode as keyof typeof CARGOS_JRV]

    await prisma.delegate.upsert({
      where: { dni: delegate.dni },
      update: {},
      create: {
        dni: delegate.dni,
        fullName: delegate.fullName,
        phone: delegate.phone,
        qrCodeEncrypted,
        qrCodeDecrypted: `${delegate.partyCode}${delegate.jrvNumber}${delegate.docType}1${delegate.cargoCode}`,
        partyCode: delegate.partyCode,
        jrvNumber: delegate.jrvNumber,
        docType: delegate.docType,
        cargoCode: delegate.cargoCode,
        cargoName: cargo.name,
        cargoType: cargo.type,
        canVote: cargo.canVote,
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

    // 4.5. Crear JRVs con códigos CNE (formato: 00001-99999)
    console.log('🗳️  Creando JRVs de prueba con códigos CNE...')

    const centerCV001 = await prisma.votingCenter.findUnique({ where: { code: 'CV-001' } })

    if (centerCV001) {
      // JRVs con códigos CNE que coinciden con los QRs de los delegados
      const jrvs = [
        { code: '00001', members: 5, description: 'JRV 1 - Escuela República de México' },
        { code: '00002', members: 5, description: 'JRV 2 - Escuela República de México' },
        { code: '00003', members: 5, description: 'JRV 3 - Escuela República de México' },
        { code: '00004', members: 5, description: 'JRV 4 - Escuela República de México' },
        { code: '00005', members: 5, description: 'JRV 5 - Escuela República de México' },
        { code: '00006', members: 5, description: 'JRV 6 - Escuela República de México' },
        { code: '00007', members: 5, description: 'JRV 7 - Escuela República de México' },
        { code: '00008', members: 5, description: 'JRV 8 - Escuela República de México' },
        { code: '00009', members: 5, description: 'JRV 9 - Escuela República de México' },
        { code: '00010', members: 5, description: 'JRV 10 - Escuela República de México' },
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

      console.log(`✅ ${jrvs.length} JRVs creadas con códigos CNE (00001-00010)`)
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
