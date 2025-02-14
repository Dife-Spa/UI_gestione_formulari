// app/formulari/scansioneFormulari/components/confirm-save-button.tsx
"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Save, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ConfirmSaveButtonProps {
 endpointUrl: string
 onSuccess?: () => void
 onError?: (error: any) => void
}

export function ConfirmSaveButton({
 endpointUrl,
 onSuccess,
 onError
}: ConfirmSaveButtonProps) {
 const [isSaving, setIsSaving] = useState(false)
 const [dialogOpen, setDialogOpen] = useState(false)
 const [successOpen, setSuccessOpen] = useState(false)

 const handleSave = async () => {
   setDialogOpen(false)
   setIsSaving(true)
   try {
     const res = await fetch(endpointUrl)
     if (!res.ok) {
       throw new Error('Errore durante il salvataggio su Supabase')
     }
     const data = await res.json()
     if (!data.success) {
       throw new Error(data.error || 'Salvataggio fallito')
     }

     setSuccessOpen(true)
     onSuccess?.()
   } catch (err) {
     onError?.(err)
   } finally {
     setIsSaving(false)
   }
 }

 return (
   <>
     <Button
       onClick={() => setDialogOpen(true)}
       disabled={isSaving}
     >
       {isSaving ? (
         <>
           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
           Salvataggio...
         </>
       ) : (
         <>
           <Save className="mr-2 h-4 w-4" />
           Conferma e Salva
         </>
       )}
     </Button>

     <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Conferma Salvataggio</DialogTitle>
           <DialogDescription>
             Sei sicuro di voler salvare i documenti elaborati su Supabase?
             Questa operazione è irreversibile.
           </DialogDescription>
         </DialogHeader>
         <DialogFooter>
           <Button
             variant="outline"
             onClick={() => setDialogOpen(false)}
           >
             Annulla
           </Button>
           <Button
             onClick={handleSave}
             disabled={isSaving}
           >
             {isSaving ? 'Salvataggio...' : 'Conferma'}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>

     <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Salvataggio Completato</DialogTitle>
         </DialogHeader>
         <Alert className="mt-4">
           <Save className="h-4 w-4" />
           <AlertTitle>Operazione completata</AlertTitle>
           <AlertDescription>
             Il salvataggio su Supabase è stato completato con successo.
           </AlertDescription>
         </Alert>
         <DialogFooter>
           <Button onClick={() => setSuccessOpen(false)}>
             Chiudi
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   </>
 )
}