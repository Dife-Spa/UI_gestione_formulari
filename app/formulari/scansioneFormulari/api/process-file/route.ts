import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir, cp, copyFile, rm } from 'fs/promises'
import { spawn } from 'child_process'
import path from 'path'
import { existsSync } from 'fs'

// Se sei su Node < 18, potresti dover importare ‘TextEncoder’ e ‘TransformStream’ da ‘util’ o usare un polyfill.

// Aggiorna questi percorsi secondo il tuo ambiente
const PYTHON_INTERPRETER = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\venv\\Scripts\\python.exe'
const PYTHON_SCRIPT_PATH = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\classificatore.py'
const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp-uploads')
const RESULTS_PATH = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\risultati.json'

/**
 * Copia cartelle, file e aggiorna percorsi nei risultati.
 * Riprende la logica del codice “funzionante”.
 */
async function copyProcessedFiles(originalFilePath: string): Promise<void> {
  // Cartella `working-temp` (nella root del tuo progetto Next)
  const workingTempDir = path.join(process.cwd(), 'working-temp')
  // Sottocartella per salvare il file originale caricato
  const originalProcessedDir = path.join(workingTempDir, 'original-processed-file')

  // Crea le directory (se non esistono)
  await mkdir(workingTempDir, { recursive: true })
  await mkdir(originalProcessedDir, { recursive: true })

  // Percorsi sorgente nel progetto Python
  const sourceImages = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\images'
  const sourceOutput = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\output'
  const sourceRisultati = RESULTS_PATH

  // Percorsi di destinazione in `working-temp`
  const targetImages = path.join(workingTempDir, 'images')
  const targetOutput = path.join(workingTempDir, 'output')
  const targetRisultati = path.join(workingTempDir, 'risultati-working.json')

  // Rimuove eventuali directory di destinazione già esistenti
  await rm(targetImages, { recursive: true, force: true })
  await rm(targetOutput, { recursive: true, force: true })

  // Copia ricorsiva delle cartelle "images" e "output"
  await cp(sourceImages, targetImages, { recursive: true })
  await cp(sourceOutput, targetOutput, { recursive: true })

  // Legge il file risultati.json e aggiorna i percorsi
  const resultsContent = await readFile(sourceRisultati, 'utf-8')
  const resultsJson = JSON.parse(resultsContent)

  if (resultsJson.percorsi_file) {
    // Aggiorna ogni percorso puntando alla cartella output in `working-temp`
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

  // Scrive il JSON aggiornato come risultati-working.json nella `working-temp`
  await writeFile(targetRisultati, JSON.stringify(resultsJson, null, 2), 'utf-8')

  // Copia il file originale caricato nella sottocartella `original-processed-file`
  const originalFileName = path.basename(originalFilePath)
  const targetOriginalFile = path.join(originalProcessedDir, originalFileName)
  await copyFile(originalFilePath, targetOriginalFile)
}

/**
 * Parsing dei messaggi di log provenienti dallo script Python
 * per inviare aggiornamenti di stato al client.
 */
function parseProgress(line: string): {
  status: string
  currentPage?: number
  totalPages?: number
} | null {
  // Esempio di debug
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
    // Assicuriamoci che la cartella temp-uploads esista
    if (!existsSync(TEMP_UPLOAD_DIR)) {
      await mkdir(TEMP_UPLOAD_DIR)
    }

    // Verifica che la richiesta sia multipart/form-data
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type deve essere multipart/form-data' },
        { status: 400 }
      )
    }

    // Estrae il file dalla formData
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Nessun file fornito o file non valido' },
        { status: 400 }
      )
    }

    // Salva fisicamente il file nella cartella temp-uploads
    const filePath = path.join(TEMP_UPLOAD_DIR, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Creiamo uno stream per inviare dati SSE al client
    const encoder = new TextEncoder()
    const stream = new TransformStream({
      transform(chunk, controller) {
        // Ogni "chunk" viene inviato come JSON su una nuova linea
        controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'))
      },
    })
    const writer = stream.writable.getWriter()

    // Avviamo lo script Python in modalità "unbuffered" per leggere l'output in tempo reale
    const pythonProcess = spawn(PYTHON_INTERPRETER, ['-u', PYTHON_SCRIPT_PATH, filePath], {
      cwd: "C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR",
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1'
      }
    })

    // Inviamo uno stato iniziale
    writer.write({ status: 'Avvio elaborazione', currentPage: 0, totalPages: 0 })

    // Legge l'output su stdout e cerca di interpretare i progressi
    pythonProcess.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n')
      lines.forEach((line: string) => {
        const clean = line.trim()
        if (!clean) return

        // Proviamo a parsare i messaggi di log
        const progress = parseProgress(clean)
        if (progress) {
          writer.write(progress)
        }
      })
    })

    // Gestisce eventuali errori su stderr
    pythonProcess.stderr.on('data', (data: Buffer) => {
      console.error('Script Python (stderr):', data.toString())
      // Inviamo un segnale di errore al client (se vuoi gestirlo come errore fatale, lo puoi fare)
      writer.write({ status: 'error', error: data.toString() })
    })

    // Quando lo script termina
    pythonProcess.on('close', async (code: number) => {
      console.log('Script Python terminato con codice:', code)
      if (code === 0) {
        // Se è andato tutto ok, copiamo i file e leggiamo i risultati
        try {
          await copyProcessedFiles(filePath)

          // Leggiamo il file "risultati-working.json" dalla cartella `working-temp`
          const workingResultsPath = path.join(process.cwd(), 'working-temp', 'risultati-working.json')
          const resultsContent = await readFile(workingResultsPath, 'utf-8')
          const results = JSON.parse(resultsContent)

          // Inviamo lo status di completamento e i risultati finali
          writer.write({ 
            status: 'Elaborazione completata',
            results
          })
        } catch (err) {
          console.error('Errore nella lettura o copia dei risultati:', err)
          writer.write({ status: 'error', error: 'Errore nella lettura dei risultati' })
        }
      } else {
        // In caso di codice di uscita != 0, segnaliamo un errore
        writer.write({ status: 'error', error: 'Script Python terminato con codice non 0' })
      }

      // Chiudiamo lo stream
      writer.close()
    })

    // Restituiamo la risposta SSE
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
