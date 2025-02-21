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

export interface FormularioEsteso extends Formulario {
  dati_formulario: {
    trasporto: {
      conducente: string;
      ora_inizio: string;
      data_inizio: string;
      targa_automezzo: string;
      targa_rimorchio: string;
    };
    caratteristiche_rifiuto: {
      eer: string;
      quantita: string;
      stato_fisico: string;
      unita_misura: string;
      aspetto: string;
      peso_verificato_partenza: string;
    };
    destinatario_info: {
      ora_arrivo: string;
      data_arrivo: string;
      quantita_accettata: string;
      carico_accettato: string;
    };
    data_emissione: {
      data_printed: string;
      data_timestamp: number;
    };
    annotazioni: string;  // Aggiunto questo campo
  };
  trasportatore: string;
  intermediario: string;
  produttore: string;
  destinatario: string;
  unita_locale_produttore: string;
  unita_locale_destinatario: string;
  id_appuntamento: string;
}