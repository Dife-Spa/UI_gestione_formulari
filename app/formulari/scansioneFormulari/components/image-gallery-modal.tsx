"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Eye, Image as ImageIcon, Loader2 } from "lucide-react"
import { FormularioRecord } from '@/app/formulari/scansioneFormulari/types/formulari'

// Inizializza il client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ImageGalleryModalProps {
  open: boolean
  onClose: () => void
  selectedFIR: string
  onFileGenerated?: () => void
}

interface StatusMessage {
  text: string
  type: 'success' | 'error' | 'info'
}

const DOCUMENT_TYPES = {
  'Formulario': 'bg-green-100 text-green-800',
  'Buono di intervento': 'bg-yellow-100 text-yellow-800',
  'Scontrino del peso': 'bg-red-100 text-red-800'
} as const

type DocumentType = keyof typeof DOCUMENT_TYPES

export function ImageGalleryModal({ 
  open, 
  onClose, 
  selectedFIR, 
  onFileGenerated 
}: ImageGalleryModalProps) {
  // Stati
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [documentType, setDocumentType] = useState<DocumentType>('Formulario')
  const [generating, setGenerating] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [record, setRecord] = useState<FormularioRecord | null>(null)

  // Reset quando si chiude la modale
  useEffect(() => {
    if (!open) {
      setSelectedImages([])
      setStatusMessage(null)
      setGenerating(false)
    }
  }, [open])

  // Carica il record del formulario e le immagini quando si apre la modale
  useEffect(() => {
    if (open) {
      setLoading(true)
      setError(null)

      const loadData = async () => {
        try {
          // Carica il record da Supabase
          const { data: recordData, error: recordError } = await supabase
            .from('formulari')
            .select('*')
            .eq('fir_number', selectedFIR)
            .single()

          if (recordError) throw recordError
          setRecord(recordData as FormularioRecord)

          // Carica le immagini dalla cartella di lavoro
          const response = await fetch('/formulari/scansioneFormulari/api/list-working-images')
          if (!response.ok) throw new Error('Errore nel recupero delle immagini')
          const imageData = await response.json()
          setImages(imageData)
        } catch (err) {
          console.error('Errore nel caricamento dei dati:', err)
          setError(err instanceof Error ? err.message : 'Errore sconosciuto')
        } finally {
          setLoading(false)
        }
      }

      loadData()
    }
  }, [open, selectedFIR])

  const handleGenerateFile = async () => {
    if (selectedImages.length === 0) {
      setStatusMessage({ 
        text: "Seleziona almeno un'immagine per generare il file.", 
        type: 'error' 
      })
      return
    }

    if (!record) {
      setStatusMessage({ 
        text: "Record del formulario non trovato.", 
        type: 'error' 
      })
      return
    }

    setGenerating(true)
    setStatusMessage(null)

    try {
      // 1. Genera il file tramite l'API
      const generateResponse = await fetch('/formulari/scansioneFormulari/api/generate-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fir: selectedFIR,
          documentType,
          selectedImages,
        }),
      })

      if (!generateResponse.ok) {
        throw new Error("Errore nella generazione del file")
      }

      const { filePath } = await generateResponse.json()

      // 2. Aggiorna il record su Supabase
      const now = new Date().toISOString()
      const updateData = {
        files: {
          ...record.files,
          [documentType]: filePath
        },
        metadata: {
          ...record.metadata,
          updated_at: now
        },
        change_history: [
          ...record.change_history,
          {
            timestamp: now,
            action: 'document_generation',
            details: {
              type: documentType,
              description: `Generato documento ${documentType} da ${selectedImages.length} immagini`,
              oldValue: record.files[documentType],
              newValue: filePath
            }
          }
        ]
      }

      const { error: updateError } = await supabase
        .from('formulari')
        .update(updateData)
        .eq('id', record.id)

      if (updateError) throw updateError

      setStatusMessage({
        text: `Documento "${documentType}" generato con successo da ${selectedImages.length} immagini e associato al formulario ${selectedFIR}`,
        type: 'success'
      })

      setSelectedImages([])
      onFileGenerated?.()

    } catch (err) {
      console.error('Errore nella generazione del documento:', err)
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Errore sconosciuto',
        type: 'error'
      })
    } finally {
      setGenerating(false)
    }
  }

  // Handler per la visualizzazione dell'immagine a schermo intero
  const viewFullImage = (imagePath: string) => {
    window.open(imagePath, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Galleria Immagini - {selectedFIR}</DialogTitle>
        </DialogHeader>

        {/* Messaggi di stato */}
        {statusMessage && (
          <Alert className={`
            ${statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : ''}
            ${statusMessage.type === 'error' ? 'bg-red-50 text-red-800' : ''}
            ${statusMessage.type === 'info' ? 'bg-blue-50 text-blue-800' : ''}
          `}>
            <AlertDescription>
              {statusMessage.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Pannello di selezione documento */}
        {selectedImages.length > 0 && (
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium">
                  Usa {selectedImages.length} immagini come:
                </p>
                <Select 
                  value={documentType} 
                  onValueChange={(value) => setDocumentType(value as DocumentType)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tipo documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(DOCUMENT_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleGenerateFile}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione...
                    </>
                  ) : (
                    'Genera file'
                  )}
                </Button>
              </div>

              {generating && <Progress value={66} />}
            </div>
          </Card>
        )}

        {/* Griglia immagini */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Caricamento immagini...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <Card
                key={idx}
                className={`
                  relative cursor-pointer transition-all
                  ${selectedImages.includes(img) ? 'ring-2 ring-primary' : ''}
                  hover:ring-1 hover:ring-primary/50
                `}
                onClick={() => {
                  setSelectedImages(prev =>
                    prev.includes(img) 
                      ? prev.filter(i => i !== img)
                      : [...prev, img]
                  )
                }}
              >
                <CardContent className="p-2">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={img}
                      alt={`Pagina ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover rounded-sm"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-white/90"
                        onClick={(e) => {
                          e.stopPropagation()
                          viewFullImage(img)
                        }}
                      >
                        <Eye className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-center text-muted-foreground">
                    Pagina {idx + 1}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}