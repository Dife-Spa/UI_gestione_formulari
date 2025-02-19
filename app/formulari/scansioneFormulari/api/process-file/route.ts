// app/formulari/scansioneFormulari/api/process-file/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir, cp, copyFile, rm } from 'fs/promises'
import { spawn } from 'child_process'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import path from 'path'
import { existsSync } from 'fs'
import { FormularioRecord, ProcessingResult } from '@/app/formulari/scansioneFormulari/types/formulari'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Aggiorna questi percorsi secondo il tuo ambiente
const PYTHON_INTERPRETER = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\venv\\Scripts\\python.exe'
const PYTHON_SCRIPT_PATH = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\classificatore.py'
const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp-uploads')
const RESULTS_PATH = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\risultati.json'

/**
 * Copia cartelle, file e aggiorna percorsi nei risultati.
 */
async function copyProcessedFiles(originalFilePath: string): Promise<void> {
  const workingTempDir = path.join(process.cwd(), 'working-temp')
  const originalProcessedDir = path.join(workingTempDir, 'original-processed-file')

  await mkdir(workingTempDir, { recursive: true })
  await mkdir(originalProcessedDir, { recursive: true })

  const sourceImages = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\images'
  const sourceOutput = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\output'
  const sourceRisultati = RESULTS_PATH

  const targetImages = path.join(workingTempDir, 'images')
  const targetOutput = path.join(workingTempDir, 'output')
  const targetRisultati = path.join(workingTempDir, 'risultati-working.json')

  await rm(targetImages, { recursive: true, force: true })
  await rm(targetOutput, { recursive: true, force: true })

  await cp(sourceImages, targetImages, { recursive: true })
  await cp(sourceOutput, targetOutput, { recursive: true })

  const resultsContent = await readFile(sourceRisultati, 'utf-8')
  const resultsJson = JSON.parse(resultsContent)

  if (resultsJson.percorsi_file) {
    for (const key in resultsJson.percorsi_file) {
      const fileObj = resultsJson.percorsi_file[key]
      for (const fileKey in fileObj) {
        if (fileObj[fileKey]) {
          const originalFile = fileObj[fileKey]
          const newFilePath = path.join(targetOutput, path.basename(originalFile))
          fileObj[fileKey] = newFilePath
        }
      }
    }
  }

  await writeFile(targetRisultati, JSON.stringify(resultsJson, null, 2), 'utf-8')

  const originalFileName = path.basename(originalFilePath)
  const targetOriginalFile = path.join(originalProcessedDir, originalFileName)
  await copyFile(originalFilePath, targetOriginalFile)
}

function parseProgress(line: string): {
  status: string
  currentPage?: number
  totalPages?: number
} | null {
  console.log('Parsing line:', line)

  if (line.includes("Tentativo di conversione PDF")) {
    return { status: "Inizializzazione conversione PDF" }
  }
  if (line.includes("Conversione PDF riuscita")) {
    const match = line.match(/Numero pagine: (\d+)/)
    const totalPages = match ? parseInt(match[1]) : undefined
    return { 
      status: "PDF convertito con successo", 
      totalPages 
    }
  }
  if (line.includes("Pagina") && line.includes("salvata in:")) {
    const match = line.match(/Pagina (\d+)/)
    const currentPage = match ? parseInt(match[1]) : undefined
    return { 
      status: "Conversione pagine in immagini",
      currentPage
    }
  }
  if (line.includes("Analisi di:")) {
    const match = line.match(/page_(\d+)\.jpg/)
    const currentPage = match ? parseInt(match[1]) : undefined
    return { 
      status: "Analisi e classificazione documenti",
      currentPage
    }
  }
  if (line.includes("Correzione FIR:")) {
    return { status: "Correzione numeri FIR" }
  }
  if (line.includes("ELABORAZIONE COMPLETATA")) {
    return { status: "Elaborazione completata" }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    if (!existsSync(TEMP_UPLOAD_DIR)) {
      await mkdir(TEMP_UPLOAD_DIR)
    }

    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type deve essere multipart/form-data' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Nessun file fornito o file non valido' },
        { status: 400 }
      )
    }

    const filePath = path.join(TEMP_UPLOAD_DIR, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const encoder = new TextEncoder()
    const stream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'))
      },
    })
    const writer = stream.writable.getWriter()

    const pythonProcess = spawn(PYTHON_INTERPRETER, ['-u', PYTHON_SCRIPT_PATH, filePath], {
      cwd: "C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR",
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1'
      }
    })

    writer.write({ status: 'Avvio elaborazione', currentPage: 0, totalPages: 0 })

    pythonProcess.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n')
      lines.forEach((line: string) => {
        const clean = line.trim()
        if (!clean) return
        const progress = parseProgress(clean)
        if (progress) {
          writer.write(progress)
        }
      })
    })

    pythonProcess.stderr.on('data', (data: Buffer) => {
      console.error('Script Python (stderr):', data.toString())
      writer.write({ status: 'error', error: data.toString() })
    })

    pythonProcess.on('close', async (code: number) => {
      console.log('Script Python terminato con codice:', code)
      if (code === 0) {
        try {
          await copyProcessedFiles(filePath)

          const workingResultsPath = path.join(process.cwd(), 'working-temp', 'risultati-working.json')
          const resultsContent = await readFile(workingResultsPath, 'utf-8')
          const processingResults: ProcessingResult = JSON.parse(resultsContent)

          // Type guard per verificare la struttura dei files
          function isValidFiles(files: unknown): files is FormularioRecord['files'] {
            if (typeof files !== 'object' || files === null) return false;
            const fileObj = files as Record<string, string | undefined>;
            const validKeys = ['Formulario', 'Buono di intervento', 'Scontrino del peso'];
            return Object.keys(fileObj).every(key => validKeys.includes(key));
          }

          // Per ogni FIR nei risultati, creiamo o aggiorniamo un record su Supabase
          for (const [fir_number, files] of Object.entries(processingResults.percorsi_file)) {
            if (!isValidFiles(files)) {
              console.error('Struttura files non valida per FIR:', fir_number);
              continue;
            }

            const now = new Date().toISOString()
            
            const newRecord: FormularioRecord = {
              id: randomUUID(),
              fir_number,
              files,
              metadata: {
                created_at: now,
                updated_at: now,
                status: 'active'
              },
              change_history: [{
                timestamp: now,
                action: 'creation',
                details: {
                  description: 'Record creato da scansione',
                  newValue: { files }
                }
              }]
            }

            const { data, error } = await supabase
              .from('formulari')
              .insert(newRecord)

            if (error) {
              console.error('Errore inserimento Supabase:', error)
              writer.write({ 
                status: 'error', 
                error: 'Errore nel salvataggio su database' 
              })
              continue
            }

            writer.write({ 
              status: 'Record salvato',
              results: newRecord
            })
          }

        } catch (err) {
          console.error('Errore nella lettura o salvataggio:', err)
          writer.write({ 
            status: 'error', 
            error: 'Errore nel processing dei risultati' 
          })
        }
      } else {
        writer.write({ 
          status: 'error', 
          error: 'Script Python terminato con errore' 
        })
      }

      writer.close()
    })

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Error generale:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}