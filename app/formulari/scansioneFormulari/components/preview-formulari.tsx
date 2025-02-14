// app/formulari/scansioneFormulari/components/preview-formulari.tsx
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageGalleryModal } from '../components/image-gallery-modal'
import { ConfirmSaveButton } from '../components/confirm-save-button'
import { Copy } from 'lucide-react'

interface PreviewFormulariProps {
  results: any
}

export function PreviewFormulari({ results }: PreviewFormulariProps) {
  const [galleryOpen, setGalleryOpen] = useState<boolean>(false)
  const [selectedFIR, setSelectedFIR] = useState<string | null>(null)
  const [localResults, setLocalResults] = useState(results)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [copiedFIR, setCopiedFIR] = useState<string | null>(null)

  const copyFIR = async (fir: string) => {
    const firWithoutSpaces = fir.replace(/\s+/g, '')
    await navigator.clipboard.writeText(firWithoutSpaces)
    setCopiedFIR(fir)
    setTimeout(() => setCopiedFIR(null), 2000)
  }

  if (!localResults?.percorsi_file) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-muted-foreground">Nessun risultato disponibile.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Anteprima Risultati</h2>
        <ConfirmSaveButton
          endpointUrl="/api/save-supabase"
          onSuccess={() => {
            console.log('Salvataggio completato con successo!')
          }}
          onError={(err) => {
            console.error('Errore durante il salvataggio su Supabase:', err)
          }}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium">Numero FIR</th>
                <th className="text-left p-4 font-medium">File Associati</th>
                <th className="text-left p-4 font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(localResults.percorsi_file).map(([fir, files]: [string, any]) => (
                <tr key={fir} className="hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fir}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyFIR(fir)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {copiedFIR === fir && (
                        <span className="text-xs text-muted-foreground">
                          Copiato!
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {files.Formulario && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Formulario
                        </Badge>
                      )}
                      {files["Buono di intervento"] && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Buono di intervento
                        </Badge>
                      )}
                      {files["Scontrino del peso"] && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                          Scontrino del peso
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedFIR(fir)
                        setGalleryOpen(true)
                      }}
                    >
                      Genera documenti
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {galleryOpen && selectedFIR && (
        <ImageGalleryModal
          open={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          selectedFIR={selectedFIR}
          onFileGenerated={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  )
}