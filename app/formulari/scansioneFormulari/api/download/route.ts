import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileParam = searchParams.get('file')

  if (!fileParam) {
    return NextResponse.json({ error: 'Parametro file mancante' }, { status: 400 })
  }

  // Decodifica il parametro
  const decodedFilePath = decodeURIComponent(fileParam)

  // Per sicurezza, assicuriamoci che il file sia all'interno di "working-temp"
  const workingTempDir = path.join(process.cwd(), 'working-temp')
  const resolvedFilePath = path.resolve(decodedFilePath)

  if (!resolvedFilePath.startsWith(workingTempDir)) {
    return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
  }

  try {
    const fileBuffer = await readFile(resolvedFilePath)
    
    // Determina il Content-Type in base all'estensione del file
    const extension = path.extname(resolvedFilePath).toLowerCase()
    let contentType = 'application/octet-stream' // Default content type

    switch (extension) {
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      // Aggiungi altri tipi di file se necessario
    }

    // Imposta headers per il download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(resolvedFilePath)}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Errore nel download del file:', error)
    return NextResponse.json({ error: 'Errore nel download del file' }, { status: 500 })
  }
}