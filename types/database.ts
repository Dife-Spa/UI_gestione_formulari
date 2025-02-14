export interface Formulario {
  id: number
  numeroFir: string
  created_at: string
  file_paths: {
    formulario?: string
    buono_intervento?: string
    scontrino?: string
  }
  gestito: boolean
  marcaGestito: string | null
}