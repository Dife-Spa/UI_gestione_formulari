import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

/**
 * Percorso dell'interprete Python (virtualenv)
 * e dello script Python che fa l'upload su Supabase.
 */
const PYTHON_INTERPRETER = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\venv\\Scripts\\python.exe'
const PYTHON_UPLOAD_SCRIPT = 'C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR\\upload_to_supabase.py'

// Se preferisci, cambia in POST se vuoi chiamarlo con fetch POST
export async function GET(req: NextRequest) {
  try {
    // Path assoluto del file risultati-working.json generato nella cartella working-temp
    const workingResultsPath = path.join(process.cwd(), 'working-temp', 'risultati-working.json')

    // Avviamo lo script Python, passando come argomento workingResultsPath
    const pythonProcess = spawn(PYTHON_INTERPRETER, [PYTHON_UPLOAD_SCRIPT, workingResultsPath], {
      // cwd: se lo script ha bisogno di girare in una specifica directory
      cwd: "C:\\Users\\lucio\\OneDrive\\Desktop\\sviluppo\\classificatoreFIR",
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1'
      }
    })

    let stdoutData = ''
    let stderrData = ''

    // Leggiamo lo stdout
    pythonProcess.stdout.on('data', (data: Buffer) => {
      stdoutData += data.toString()
    })

    // Leggiamo lo stderr
    pythonProcess.stderr.on('data', (data: Buffer) => {
      stderrData += data.toString()
    })

    // Al termine, restituiamo una risposta al client
    // Usiamo una Promise per aspettare l'evento 'close'
    return new Promise((resolve) => {
      pythonProcess.on('close', (code: number) => {
        console.log('Script Python terminato con codice:', code)
        console.log('--- stdout ---')
        console.log(stdoutData)
        console.log('--- stderr ---')
        console.log(stderrData)

        if (code === 0) {
          // success
          resolve(
            NextResponse.json({
              success: true,
              message: 'Salvataggio su Supabase completato con successo!',
              stdout: stdoutData
            })
          )
        } else {
          // errore
          resolve(
            NextResponse.json({
              success: false,
              error: 'Errore durante il salvataggio su Supabase',
              stderr: stderrData
            }, { status: 500 })
          )
        }
      })
    })
  } catch (error) {
    console.error('Errore interno nella route /api/save-supabase:', error)
    return NextResponse.json(
      { error: 'Errore interno durante il salvataggio' },
      { status: 500 }
    )
  }
}
