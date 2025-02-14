import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  // Costruisce il percorso assoluto del file risultati-working.json nella cartella working-temp
  const workingResultsPath = path.join(process.cwd(), 'working-temp', 'risultati-working.json')
  try {
    const content = await readFile(workingResultsPath, 'utf-8')
    const results = JSON.parse(content)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Errore nella lettura dei risultati lavorati:', error)
    return NextResponse.json({ error: 'Errore nella lettura dei risultati lavorati' }, { status: 500 })
  }
}
