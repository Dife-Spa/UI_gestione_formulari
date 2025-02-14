import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import path from 'path'

export async function GET() {
  // Costruisce il percorso della cartella working-temp/images
  const imagesDir = path.join(process.cwd(), 'working-temp', 'images')
  try {
    // Legge la lista dei file nella cartella
    const files = await readdir(imagesDir)
    // Per ogni file, costruisce l'URL per scaricarlo tramite l'endpoint /api/download
    const imageUrls = files.map((filename) => {
      // Costruisce il percorso completo del file
      const filePath = path.join(imagesDir, filename)
      // Restituisce l'URL di download
      return `/formulari/scansioneFormulari/api/download?file=${encodeURIComponent(filePath)}`
    })
    return NextResponse.json(imageUrls)
  } catch (error) {
    console.error('Errore durante la lettura della cartella delle immagini:', error)
    return NextResponse.json(
      { error: 'Errore durante la lettura della cartella delle immagini' },
      { status: 500 }
    )
  }
}
