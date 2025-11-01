import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jrvId = formData.get('jrvId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    if (!jrvId) {
      return NextResponse.json({ error: 'No se proporcionó jrvId' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se permiten imágenes JPG y PNG.' },
        { status: 400 }
      );
    }

    // Validar tamaño de archivo (5MB máximo)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande. El tamaño máximo es 5MB.' },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitizar jrvId (solo alfanuméricos y guiones)
    const sanitizedJrvId = jrvId.replace(/[^a-zA-Z0-9-]/g, '');

    // Crear nombre único para el archivo con extensión correcta
    const timestamp = Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `acta_${sanitizedJrvId}_${timestamp}.${extension}`;

    // Ruta de destino
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'actas');
    const filePath = path.join(uploadDir, fileName);

    // Crear directorio si no existe
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Guardar archivo
    await writeFile(filePath, buffer);

    // Retornar URL pública
    const publicUrl = `/uploads/actas/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}
