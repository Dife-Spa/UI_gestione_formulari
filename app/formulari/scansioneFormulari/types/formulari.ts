// types/formulari.ts

export interface ChangeRecord {
    timestamp: string;
    action: 'creation' | 'document_generation' | 'metadata_update';
    details: {
      type?: 'Formulario' | 'Buono di intervento' | 'Scontrino del peso';
      description: string;
      oldValue?: any;
      newValue?: any;
    };
    user?: string;
  }
  
  export interface FormularioRecord {
    id: string;
    fir_number: string;
    files: {
      Formulario?: string;
      'Buono di intervento'?: string;
      'Scontrino del peso'?: string;
    };
    metadata: {
      created_at: string;
      updated_at: string;
      status: 'active' | 'archived' | 'deleted';
    };
    change_history: ChangeRecord[];
  }
  
  export interface ProcessingResult {
    percorsi_file: {
      [fir: string]: {
        Formulario?: string;
        'Buono di intervento'?: string;
        'Scontrino del peso'?: string;
      };
    };
  }