import { type SortingState, type ExpandedState } from '@tanstack/react-table';

export interface Trasporto {
  conducente: string;
  targa_automezzo: string;
  targa_rimorchio?: string;
  data_inizio: string;
  ora_inizio: string;
}

export interface CaratteristicheRifiuto {
  eer: string;
  quantita: number;
  unita_misura: string;
  stato_fisico: string;
  peso_verificato_partenza: string;
}

export interface DestinatarioInfo {
  data_arrivo: string;
  ora_arrivo: string;
  quantita_accettata: number;
  carico_accettato: string;
}

export interface DatiFormulario {
  data_emissione: {
    data_timestamp: string;
  };
  trasporto: Trasporto;
  caratteristiche_rifiuto: CaratteristicheRifiuto;
  destinatario_info: DestinatarioInfo;
  annotazioni?: string;
}

export interface FilePaths {
  formulario?: string;
  buono_intervento?: string;
  scontrino?: string;
}

export interface Formulario {
  id: number;
  numeroFir: string;
  id_appuntamento?: number;
  trasportatore: string;
  intermediario?: string;
  produttore: string;
  unita_locale_produttore: string;
  destinatario: string;
  unita_locale_destinatario: string;
  gestito: boolean;
  marcaGestito?: string;
  dati_formulario: DatiFormulario;
  file_paths: FilePaths;
}

export interface CopyButtonProps {
  text: string;
  size?: "normal" | "small";
  className?: string;
}

export interface TruncatedTextProps {
  text: string;
  limit?: number;
}

export interface StatusBadgeProps {
  gestito: boolean;
  marcaGestito?: string;
}

export interface ActionsMenuProps {
  formulario: Formulario;
  onDelete: (id: number) => void;
  onGestione: (id: number, gestito: boolean) => void;
  onDownload: (path: string) => void;
}

export interface FormulariTableProps {
  formulari: Formulario[];
  onDelete: (id: number) => void;
  onGestione: (id: number, gestito: boolean) => void;
  onDownload: (path: string) => void;
  loading: boolean;
}