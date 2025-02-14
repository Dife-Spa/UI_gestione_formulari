import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'

const RESULTS_PATH = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\risultati.json'

export async function GET() {
  try {
    const resultsContent = await readFile(RESULTS_PATH, 'utf-8')
    const results = JSON.parse(resultsContent)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Errore nella lettura del file risultati.json:', error)
    return NextResponse.json({ error: 'Errore nella lettura dei risultati' }, { status: 500 })
  }
}
