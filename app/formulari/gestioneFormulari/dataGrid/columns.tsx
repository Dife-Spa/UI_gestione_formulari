// dataGrid/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { FormularioRecord } from "./types";
import { CopyButton } from "./copy-button";
import { TruncatedText } from "./truncated-text";

export const columns: ColumnDef<FormularioRecord>[] = [
  {
    id: "expander",
    header: "",
    cell: ({ row }) => (
      <button
        onClick={() => row.toggleExpanded()}
        className="p-1 rounded hover:bg-gray-100"
      >
        {row.getIsExpanded() ? "▲" : "▼"}
      </button>
    ),
    size: 40,
  },
  // In columns.tsx, modifica la colonna numeroFormulario

  {
    accessorKey: "numeroFormulario",
    header: "Numero Formulario",
    cell: ({ row }) => {
      const formulario = row.getValue("numeroFormulario") as string;
      const appuntamento = row.original.idAppuntamento;
  
      // Stampiamo il valore per debug
      console.log("ID Appuntamento per " + formulario + ":", appuntamento);
  
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-medium">{formulario}</span>
            <CopyButton text={formulario} className="text-blue-600" />
          </div>
          <div className="flex items-center gap-1 mt-1">
            {appuntamento && appuntamento.trim() !== "" ? (
              <>
                <span className="text-sm text-gray-500">{appuntamento}</span>
                <CopyButton text={appuntamento} size="small" className="text-gray-500" />
              </>
            ) : (
              <span className="text-sm text-red-400">Appuntamento non trovato</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "dataEmissione",
    header: "Data Emissione",
    filterFn: (row, columnId, filterValue: { from?: string; to?: string }) => {
      const cellValue = row.getValue<string>(columnId);
      const cellDate = new Date(cellValue);
      const fromDate = filterValue.from ? new Date(filterValue.from) : null;
      const toDate = filterValue.to ? new Date(filterValue.to) : null;
      if (fromDate && cellDate < fromDate) return false;
      if (toDate && cellDate > toDate) return false;
      return true;
    },
    cell: info => {
      // Formatta la data in gg/mm/yyyy
      const date = new Date(info.getValue<string>());
      if (isNaN(date.getTime())) return info.getValue(); // Ritorna il valore originale se non è una data valida
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    },
  },
  {
    accessorKey: "produttore",
    header: "Produttore",
    cell: ({ row }) => <TruncatedText text={row.getValue("produttore")} />
  },
  {
    accessorKey: "destinatario",
    header: "Destinatario",
    cell: ({ row }) => <TruncatedText text={row.getValue("destinatario")} />
  },
  {
    accessorKey: "trasportatore",
    header: "Trasportatore",
    cell: ({ row }) => <TruncatedText text={row.getValue("trasportatore")} />
  },
  {
    accessorKey: "intermediario",
    header: "Intermediario",
    cell: ({ row }) => <TruncatedText text={row.getValue("intermediario")} />
  },
  {
    id: "documenti",
    header: "Documenti",
    cell: ({ row }) => {
      const filePaths = row.original.filePaths;
      
      // Funzione per aprire/scaricare il documento
      const handleDocumentClick = (path: string | undefined) => {
        if (!path) return;
        
        // Se il percorso è già un URL completo
        if (path.startsWith('http')) {
          window.open(path, '_blank');
        } else {
          // Utilizza la variabile di ambiente per costruire l'URL
          const baseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL || '';
          // Rimuovi eventuali slash iniziali dal percorso
          const cleanPath = path.startsWith('/') ? path.substring(1) : path;
          const fullUrl = `${baseStorageUrl}${cleanPath}`;
          window.open(fullUrl, '_blank');
        }
      };
      
      return (
        <div className="flex gap-2">
          {filePaths?.formulario && (
            <button 
              onClick={() => handleDocumentClick(filePaths.formulario)}
              className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              FORMULARIO
            </button>
          )}
          {filePaths?.scontrino && (
            <button 
              onClick={() => handleDocumentClick(filePaths.scontrino)}
              className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
            >
              SCONTRINO
            </button>
          )}
          {filePaths?.buono && (
            <button 
              onClick={() => handleDocumentClick(filePaths.buono)}
              className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
            >
              BUONO
            </button>
          )}
        </div>
      );
    },
  },
];
