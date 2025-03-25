// dataGrid/expandable-row.tsx
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Row } from "@tanstack/react-table";
import { FormularioRecord } from "./types";

export function ExpandableRow({ row }: { row: Row<FormularioRecord> }) {
  const record = row.original;
  
  return (
    <div className="bg-gray-50 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Informazioni Dettagliate</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Numero Formulario:</span> {record.numeroFormulario}</p>
            <p><span className="font-medium">Data Emissione:</span> {new Date(record.dataEmissione).toLocaleDateString()}</p>
            <p><span className="font-medium">Trasportatore:</span> {record.trasportatore}</p>
            {record.intermediario && (
              <p><span className="font-medium">Intermediario:</span> {record.intermediario}</p>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Produttore e Destinatario</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Produttore:</span> {record.produttore}</p>
            <p><span className="font-medium">Unità Locale Produttore:</span> {record.unitaLocaleProduttore}</p>
            <p><span className="font-medium">Destinatario:</span> {record.destinatario}</p>
          </div>
        </div>
      </div>
    </div>
  );
}