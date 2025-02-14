// app/formulari/scansione-formulari/components/file-upload.tsx
"use client"

// Dichiarazione del tipo per window.pdfjsLib
declare global {
  interface Window {
    pdfjsLib: any
  }
}


import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { FileText, Eye, X, Upload } from "lucide-react"

interface ProcessingStatus {
  isProcessing: boolean
  currentState: string
  progress: number
  currentPage?: number
  totalPages?: number
  error?: string
}

interface FileWithPageCount extends File {
  pageCount?: number
}

interface FileUploadProps {
  onFilesUploaded: (files: FileWithPageCount[]) => void
  onProcessingComplete: (results: any) => void
}

export function FileUpload({ onFilesUploaded, onProcessingComplete }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPageCount[]>([])
  const [processingStatus, setProcessingStatus] = useState<{ [key: string]: ProcessingStatus }>({})
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      setPdfLibLoaded(true)
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const countPdfPages = async (file: File): Promise<number> => {
    if (!pdfLibLoaded) return 0
    
    const arrayBuffer = await file.arrayBuffer()
    const typedarray = new Uint8Array(arrayBuffer)
    
    try {
      const pdf = await window.pdfjsLib.getDocument(typedarray).promise
      return pdf.numPages
    } catch (error) {
      console.error('Errore nel conteggio delle pagine:', error)
      return 0
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const filesWithoutPages = acceptedFiles.map(file => 
      Object.assign(file, { pageCount: undefined }) as FileWithPageCount
    )
    setUploadedFiles(prev => [...prev, ...filesWithoutPages])

    const filesWithPages = await Promise.all(
      acceptedFiles.map(async (file) => {
        const pageCount = await countPdfPages(file)
        return Object.assign(file, { pageCount }) as FileWithPageCount
      })
    )
    setUploadedFiles(prev => {
      const updatedFiles = prev.map(prevFile => {
        const matchingFile = filesWithPages.find(f => f.name === prevFile.name)
        return matchingFile || prevFile
      })
      return updatedFiles
    })
    onFilesUploaded(filesWithPages)
  }, [onFilesUploaded, pdfLibLoaded])

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onFilesUploaded(newFiles)
  }, [uploadedFiles, onFilesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  })

  const processFile = async (file: FileWithPageCount) => {
    const initialStatus: ProcessingStatus = {
      isProcessing: true,
      currentState: 'Inizializzazione',
      progress: 0,
      currentPage: 0,
      totalPages: file.pageCount || 0
    }

    setProcessingStatus(prev => ({
      ...prev,
      [file.name]: initialStatus
    }))

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/formulari/scansioneFormulari/api/process-file', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Elaborazione fallita')
      if (!response.body) throw new Error('Response body non disponibile')
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (!value) continue

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (!line.trim()) continue
          
          try {
            const update = JSON.parse(line)

            if (update.results) {
              onProcessingComplete(update.results)
              setProcessingStatus(prev => ({
                ...prev,
                [file.name]: {
                  isProcessing: false,
                  currentState: 'Elaborazione completata',
                  progress: 100,
                  currentPage: file.pageCount,
                  totalPages: file.pageCount
                }
              }))
              continue
            }

            setProcessingStatus(prev => {
              const prevStatus = prev[file.name] || initialStatus
              const newStatus = {
                isProcessing: true,
                currentState: update.status,
                currentPage: update.currentPage ?? prevStatus.currentPage,
                totalPages: update.totalPages ?? prevStatus.totalPages,
                progress: 0
              }

              if (newStatus.currentPage && newStatus.totalPages) {
                newStatus.progress = (newStatus.currentPage / newStatus.totalPages) * 100
              }

              return {
                ...prev,
                [file.name]: newStatus
              }
            })
          } catch (e) {
            console.error('Error parsing line:', line, e)
          }
        }
      }

    } catch (error) {
      console.error('Errore durante l\'elaborazione:', error)
      setProcessingStatus(prev => ({
        ...prev,
        [file.name]: {
          isProcessing: false,
          currentState: 'Errore durante l\'elaborazione',
          progress: 0,
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        }
      }))
    }
  }

  const openPdf = (file: File) => {
    const url = URL.createObjectURL(file)
    window.open(url, '_blank')
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div 
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg">Rilascia i file qui...</p>
          ) : (
            <>
              <p className="text-lg font-medium">Trascina qui i tuoi PDF</p>
              <p className="text-sm text-muted-foreground">oppure clicca per selezionarli</p>
            </>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">File caricati:</h3>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.pageCount} pagine
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openPdf(file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {processingStatus[file.name] ? (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{processingStatus[file.name].currentState}</span>
                        {processingStatus[file.name].currentPage && processingStatus[file.name].totalPages && (
                          <span>
                            Pagina {processingStatus[file.name].currentPage} di {processingStatus[file.name].totalPages}
                          </span>
                        )}
                      </div>
                      <Progress value={processingStatus[file.name].progress} />
                      {processingStatus[file.name].error && (
                        <p className="text-sm text-destructive">
                          {processingStatus[file.name].error}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => processFile(file)}
                      className="mt-4"
                    >
                      Avvia elaborazione
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}