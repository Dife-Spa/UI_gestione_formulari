// types.ts
export interface FormularioRecord {
  numeroFormulario: string;
  dataEmissione: string;
  produttore: string;
  destinatario: string;
  trasportatore: string;
  intermediario: string;
  filePaths?: {
    formulario?: string;
    scontrino?: string;
    buono?: string;
  };
  idAppuntamento?: string;
  unitaLocaleProduttore?: string;
  unitaLocaleDestinatario?: string;
  datiFormulario?: {
    trasporto: {
      conducente: string;
      targa_automezzo: string;
      targa_rimorchio?: string;
      data_inizio?: string;
      ora_inizio?: string;
    };
    caratteristiche_rifiuto: {
      eer: string;
      quantita: number;
      unita_misura: string;
      stato_fisico: string;
      aspetto?: string;
      peso_verificato_partenza?: string;
    };
    produttore?: {
      denominazione?: string;
      unita_locale?: string;
    };
    destinatario?: {
      denominazione?: string;
      unita_locale?: string;
    };
    destinatario_info?: {
      data_arrivo?: string;
      ora_arrivo?: string;
      carico_accettato?: string;
      quantita_accettata?: string;
      quantita_respinta?: string;
      attesa_verifica?: string;
      motivazioni?: string;
    };
    intermediario?: {
      denominazione?: string;
    };
    annotazioni?: string;
    numero_fir?: string;
    data_emissione?: {
      data_printed?: string;
      data_timestamp?: number;
    };
  };
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
  
  export interface ActionsMenuProps {
    formulario: FormularioRecord;
    onDelete?: (id: string) => void;
    onGestione?: (id: string, gestito: boolean) => void;
    onDownload?: (path: string) => void;
  }
  
  export interface DataTableProps {
    data: FormularioRecord[];
    loading?: boolean;
    onDelete?: (id: string) => void;
    onGestione?: (id: string, gestito: boolean) => void;
    onDownload?: (path: string) => void;
  }