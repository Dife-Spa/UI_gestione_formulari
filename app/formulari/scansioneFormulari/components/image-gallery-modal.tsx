// app/formulari/scansioneFormulari/components/image-gallery-modal.tsx
"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { X, Eye, Image as ImageIcon } from "lucide-react"

interface ImageGalleryModalProps {
  open: boolean
  onClose: () => void
  selectedFIR: string
  onFileGenerated?: () => void
}

export function ImageGalleryModal({ 
  open, 
  onClose, 
  selectedFIR, 
  onFileGenerated 
}: ImageGalleryModalProps) {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [documentType, setDocumentType] = useState<string>('Formulario')
  const [generating, setGenerating] = useState<boolean>(false)
  const [generateMessage, setGenerateMessage] = useState<{ text: string; type: 'success' | 'error' }>({ 
    text: '', 
    type: 'success' 
  })

  // Reset quando si chiude la modale
  useEffect(() => {
    if (!open) {
      setSelectedImages([])
      setGenerateMessage({ text: '', type: 'success' })
    }
  }, [open])

  // Carica le immagini
  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch('/formulari/scansioneFormulari/api/list-working-images')
        .then(res => {
          if (!res.ok) throw new Error('Errore nel recupero delle immagini')
          return res.json()
        })
        .then(data => {
          setImages(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setError(err.message)
          setLoading(false)
        })
    }
  }, [open])

  const handleGenerateFile = async () => {
    if (selectedImages.length === 0) {
      setGenerateMessage({ 
        text: "Seleziona almeno un'immagine per generare il file.", 
        type: 'error' 
      })
      return
    }

    setGenerating(true)
    setGenerateMessage({ text: '', type: 'success' })

    try {
      const response = await fetch('/formulari/scansioneFormulari/api/generate-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fir: selectedFIR,
          documentType,
          selectedImages,
        }),
      })

      if (!response.ok) throw new Error("Errore nella generazione del file")
      
      setGenerateMessage({
        text: `Ho generato un documento "${documentType}" composto da ${selectedImages.length} immagini e l'ho associato al formulario ${selectedFIR}`,
        type: 'success'
      })
      
      setSelectedImages([])
      onFileGenerated?.()
      
    } catch (err: any) {
      console.error(err)
      setGenerateMessage({
        text: `Errore: ${err.message}`,
        type: 'error'
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Galleria Immagini - {selectedFIR}</DialogTitle>
        </DialogHeader>

        {generateMessage.text && (
          <div className={`p-4 rounded-lg ${
            generateMessage.type === 'success' 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            <p className="text-sm">{generateMessage.text}</p>
          </div>
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
                  onValueChange={setDocumentType}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Tipo documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Formulario">Formulario</SelectItem>
                    <SelectItem value="Buono di intervento">Buono di intervento</SelectItem>
                    <SelectItem value="Scontrino del peso">Scontrino del peso</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleGenerateFile}
                  disabled={generating}
                >
                  {generating ? 'Generazione...' : 'Genera file'}
                </Button>
              </div>

              {generating && <Progress value={66} />}
            </div>
          </Card>
        )}

        {/* Griglia immagini */}
        {loading ? (
          <div className="text-center py-8">Caricamento immagini...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <Card
                key={idx}
                className={`
                  relative cursor-pointer transition-all
                  ${selectedImages.includes(img) ? 'ring-2 ring-primary' : ''}
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
                      <Eye className="h-6 w-6 text-white" />
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