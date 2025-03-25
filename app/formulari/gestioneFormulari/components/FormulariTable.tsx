import React, { useState, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ExpandedState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, MoreVertical, FileDown, CheckCircle, Trash2, Copy, ArrowUpDown } from 'lucide-react';
import type {
  Formulario,
  CopyButtonProps,
  TruncatedTextProps,
  StatusBadgeProps,
  ActionsMenuProps,
  FormulariTableProps,
} from '@/app/formulari/gestioneFormulari/components/FormulariTypes';
import { FormularioRecord } from '../dataGrid/types';
import { DataTable } from '../dataGrid/data-table';

const CopyButton: React.FC<CopyButtonProps> = React.memo(({ 
  text, 
  size = "normal", 
  className = "" 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1000);
  }, [text]);

  return (
    <div className="relative inline-block">
      <button
        className={`p-1 rounded hover:bg-gray-100 ${size === "normal" ? "h-6 w-6" : "h-4 w-4"} ${className}`}
        onClick={handleCopy}
      >
        <Copy className={size === "normal" ? "h-4 w-4" : "h-3 w-3"} />
      </button>
      {showTooltip && (
        <div className="absolute z-10 px-2 py-1 text-sm text-white bg-gray-800 rounded -top-8 left-1/2 transform -translate-x-1/2">
          Copiato!
        </div>
      )}
    </div>
  );
});

const TruncatedText: React.FC<TruncatedTextProps> = React.memo(({ text, limit = 15 }) => {
  const [showFullText, setShowFullText] = useState(false);
  
  if (text.length <= limit) return <span>{text}</span>;
  
  return (
    <div className="relative group">
      <span 
        className="cursor-help" 
        onMouseEnter={() => setShowFullText(true)} 
        onMouseLeave={() => setShowFullText(false)}
      >
        {text.slice(0, limit)}...
      </span>
      {showFullText && (
        <div className="absolute z-10 p-2 text-sm bg-white border rounded shadow-lg max-w-xs whitespace-normal break-words">
          {text}
        </div>
      )}
    </div>
  );
});

const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ gestito, marcaGestito }) => {
  if (gestito && marcaGestito) {
    return (
      <span className="px-2 py-1 text-sm font-medium rounded bg-green-100 text-green-800">
        Gestito il {new Date(marcaGestito).toLocaleString('it-IT')}
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-sm font-medium rounded bg-yellow-100 text-yellow-800">
      Da Gestire
    </span>
  );
});

const ActionsMenu: React.FC<ActionsMenuProps> = React.memo(({ 
  formulario, 
  onDelete, 
  onGestione, 
  onDownload 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="p-1 rounded hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-10">
          {formulario.file_paths?.formulario && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
              onClick={() => {
                onDownload(formulario.file_paths.formulario!);
                setIsOpen(false);
              }}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Scarica
            </button>
          )}
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
            onClick={() => {
              onGestione(formulario.id, formulario.gestito);
              setIsOpen(false);
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {formulario.gestito ? 'Marca come da gestire' : 'Marca come gestito'}
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-red-600"
            onClick={() => {
              onDelete(formulario.id);
              setIsOpen(false);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina
          </button>
        </div>
      )}
    </div>
  );
});

const FormulariTable: React.FC<FormulariTableProps> = ({ 
  formulari, 
  onDelete, 
  onGestione, 
  onDownload, 
  loading 
}) => {
  // Remove any debugger statements that might be here
  
  const formattedData: FormularioRecord[] = formulari.map(formulario => ({
    id: formulario.id.toString(),
    numeroFormulario: formulario.numeroFir || 'N/A',
    dataEmissione: formulario.dati_formulario?.data_emissione?.data_timestamp || new Date().toISOString(),
    trasportatore: formulario.trasportatore || '',
    intermediario: formulario.intermediario || '',
    produttore: formulario.produttore || '',
    unitaLocaleProduttore: formulario.unita_locale_produttore || '',
    unitaLocaleDestinatario: formulario.unita_locale_destinatario || '',
    destinatario: formulario.destinatario || '',
    filePaths: formulario.file_paths || {},
    idAppuntamento: formulario.id_appuntamento?.toString() || '',
    gestito: formulario.gestito || false,
    marcaGestito: formulario.marcaGestito
  }));

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <DataTable data={formattedData} />
      )}
    </div>
  );
};

export default FormulariTable;