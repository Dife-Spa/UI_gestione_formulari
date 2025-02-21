import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, MoreVertical, FileDown, CheckCircle, Trash2, Copy } from 'lucide-react';
import type { Formulario, FormularioEsteso } from "@/types/database";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DocumentButton } from "@/components/DocumentButton";
import FormularioExpanded from "./FormulariExpandend"
import TablePagination from "./pagination";

interface FormulariTableProps {
  formulari: FormularioEsteso[];
  loading: boolean;
  onDelete: (id: number) => void;
  onGestione: (id: number, gestito: boolean) => void;
  onDownload: (path: string) => void;
}

const CopyButton = ({ 
    text, 
    size = "normal", 
    className = "" 
  }: { 
    text: string; 
    size?: "normal" | "small"; 
    className?: string;
  }) => {
    const [showTooltip, setShowTooltip] = useState(false);
  
    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
      setShowTooltip(true);
      // Nascondi il tooltip dopo 2 secondi
      setTimeout(() => setShowTooltip(false), 1000);
    };
  
    return (
      <TooltipProvider>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`${size === "normal" ? "h-6 w-6" : "h-4 w-4"} p-0 hover:bg-muted/50 ${className}`}
              onClick={handleCopy}
            >
              <Copy className={size === "normal" ? "h-4 w-4" : "h-3 w-3"} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copiato!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

const TruncatedText = ({ text, limit = 15 }: { text: string; limit?: number }) => {
  if (text.length <= limit) return <span>{text}</span>;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-help">
          <span>{text.slice(0, limit)}...</span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs whitespace-normal break-words">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const FormulariTable: React.FC<FormulariTableProps> = ({ 
  formulari, 
  onDelete, 
  onGestione, 
  onDownload, 
  loading 
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const contentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});


  // Aggiungi stati per la paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(200);

  // Calcola i formulari da mostrare nella pagina corrente
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, formulari.length);
  const currentFormulari = formulari.slice(startIndex, endIndex);

  // Gestione cambio pagina
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedRows(new Set()); // Reset expanded rows when changing page
  };

  // Gestione cambio dimensione pagina
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
    setExpandedRows(new Set()); // Reset expanded rows
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleRowSelection = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === formulari.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(formulari.map(f => f.id)));
    }
  };

  const renderExpandedContent = (formulario: FormularioEsteso) => {
    return (
      <div className="px-4 py-3">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-lg">
              Dettagli Formulario {formulario.numeroFir}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm">Informazioni Trasporto</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Trasportatore</p>
                    <p>{formulario.trasportatore}</p>
                  </div>
                  {formulario.intermediario !== 'non presente' && (
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="text-muted-foreground">Intermediario</p>
                      <p>{formulario.intermediario}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Conducente</p>
                    <p>{formulario.dati_formulario.trasporto.conducente}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Targa Automezzo</p>
                    <p>{formulario.dati_formulario.trasporto.targa_automezzo}</p>
                  </div>
                  {formulario.dati_formulario.trasporto.targa_rimorchio !== 'non presente' && (
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="text-muted-foreground">Targa Rimorchio</p>
                      <p>{formulario.dati_formulario.trasporto.targa_rimorchio}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Data/Ora Inizio</p>
                    <p>{formulario.dati_formulario.trasporto.data_inizio} {formulario.dati_formulario.trasporto.ora_inizio}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm">Produttore</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Denominazione</p>
                    <p>{formulario.produttore}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Unità Locale</p>
                    <p className="break-words">{formulario.unita_locale_produttore}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm">Caratteristiche Rifiuto</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Codice EER</p>
                    <p>{formulario.dati_formulario.caratteristiche_rifiuto.eer}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Quantità</p>
                    <p>{formulario.dati_formulario.caratteristiche_rifiuto.quantita} {formulario.dati_formulario.caratteristiche_rifiuto.unita_misura}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Stato Fisico</p>
                    <p>{formulario.dati_formulario.caratteristiche_rifiuto.stato_fisico}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Peso Verificato</p>
                    <p>{formulario.dati_formulario.caratteristiche_rifiuto.peso_verificato_partenza}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm">Accettazione</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Data/Ora Arrivo</p>
                    <p>{formulario.dati_formulario.destinatario_info.data_arrivo} {formulario.dati_formulario.destinatario_info.ora_arrivo}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Quantità Accettata</p>
                    <p>{formulario.dati_formulario.destinatario_info.quantita_accettata} {formulario.dati_formulario.caratteristiche_rifiuto.unita_misura}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4">
                    <p className="text-muted-foreground">Stato Accettazione</p>
                    <p>{formulario.dati_formulario.destinatario_info.carico_accettato}</p>
                  </div>
                  {formulario.dati_formulario.annotazioni && (
                    <div className="grid grid-cols-2 gap-x-4">
                      <p className="text-muted-foreground">Note</p>
                      <p>{formulario.dati_formulario.annotazioni}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
          <TableHead className="w-12">
            <Checkbox 
              checked={selectedRows.size === formulari.length} 
              onCheckedChange={toggleAllRows}
            />
          </TableHead>
          <TableHead className="w-10"></TableHead>
          <TableHead>Numero FIR</TableHead>
          <TableHead>Data Emissione</TableHead>
          <TableHead>Produttore</TableHead>
          <TableHead>Destinatario</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead>Documenti</TableHead>
          <TableHead className="w-[100px]">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                Caricamento...
              </TableCell>
            </TableRow>
          ) : (
          formulari.map((formulario) => (
            <React.Fragment key={formulario.id}>
              <TableRow 
                    className={`
                        hover:bg-muted/50 
                        transition-all 
                        duration-300
                        ${selectedRows.has(formulario.id) ? 'bg-muted/30' : ''}
                    `}
                    >
                    <TableCell className="p-2">
                        <Checkbox 
                        checked={selectedRows.has(formulario.id)}
                        onCheckedChange={() => toggleRowSelection(formulario.id)}
                        onClick={(e) => e.stopPropagation()}
                        />
                    </TableCell>
                    <TableCell className="p-2">
                        {/* Sposta l'onClick qui sul Button */}
                        <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 p-0"
                        onClick={() => toggleRow(formulario.id)}
                        >
                        {expandedRows.has(formulario.id) ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                        </Button>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1">
                            <div className="font-medium">{formulario.numeroFir}</div>
                            <CopyButton text={formulario.numeroFir} />
                        </div>
                        {formulario.id_appuntamento && (
                            <div className="flex items-center gap-1 mt-0.5">
                            <div className="text-xs text-muted-foreground">#{formulario.id_appuntamento}</div>
                            <CopyButton 
                                text={formulario.id_appuntamento.toString()} 
                                size="small" 
                                className="text-muted-foreground"
                            />
                            </div>
                        )}
                        </TableCell>
                <TableCell>
                  {new Date(formulario.dati_formulario.data_emissione.data_timestamp).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell>
                  <div><TruncatedText text={formulario.produttore} /></div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <TruncatedText text={formulario.unita_locale_produttore} />
                  </div>
                </TableCell>
                <TableCell>
                  <div><TruncatedText text={formulario.destinatario} /></div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <TruncatedText text={formulario.unita_locale_destinatario} />
                  </div>
                </TableCell>
                <TableCell>
                  {formulario.gestito ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Gestito il {new Date(formulario.marcaGestito!).toLocaleString('it-IT')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Da Gestire
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {formulario.file_paths?.formulario && (
                      <DocumentButton 
                        path={formulario.file_paths.formulario} 
                        label="FIR"
                        variant="fir"
                      />
                    )}
                    {formulario.file_paths?.buono_intervento && (
                      <DocumentButton 
                        path={formulario.file_paths.buono_intervento} 
                        label="Buono"
                        variant="buono"
                      />
                    )}
                    {formulario.file_paths?.scontrino && (
                      <DocumentButton 
                        path={formulario.file_paths.scontrino} 
                        label="Scontrino"
                        variant="scontrino"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {formulario.file_paths?.formulario && (
                        <DropdownMenuItem
                          onClick={() => onDownload(formulario.file_paths.formulario!)}
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Scarica
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onGestione(formulario.id, formulario.gestito)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {formulario.gestito ? 'Marca come da gestire' : 'Marca come gestito'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(formulario.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                    <TableCell colSpan={9} className="p-0">
                        <div 
                        ref={(el: HTMLDivElement | null) => {
                            if (el) {
                            contentRefs.current[formulario.id] = el;
                            }
                        }}
                        className="overflow-hidden transition-all duration-300 ease-in-out bg-muted/5"
                        style={{ 
                            height: expandedRows.has(formulario.id) ? contentRefs.current[formulario.id]?.scrollHeight + 'px' : '0px',
                            opacity: expandedRows.has(formulario.id) ? 1 : 0,
                        }}
                        >
                        <FormularioExpanded formulario={formulario} />
                        </div>
                    </TableCell>
                    </TableRow>
            </React.Fragment>
          ))
        )}
      </TableBody>
    </Table>
    
    {formulari.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={formulari.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
);
};

export default FormulariTable;