import React from 'react';
import type { FormularioEsteso } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormularioExpandedProps {
  formulario: FormularioEsteso;
}

const FormularioExpanded: React.FC<FormularioExpandedProps> = ({ formulario }) => {
  const InfoCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card className="shadow-none border w-fit min-w-[300px]">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-3">
        <div className="grid gap-y-0.5">
          {children}
        </div>
      </CardContent>
    </Card>
  );

  const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-[120px_1fr] items-center gap-x-2">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );

  return (
    <div className="pl-24 py-2">
      <div className="flex flex-row flex-wrap gap-3 justify-start items-start">
        <InfoCard title="Informazioni Trasporto">
          <InfoRow label="Trasportatore" value={formulario.trasportatore} />
          {formulario.intermediario !== 'non presente' && (
            <InfoRow label="Intermediario" value={formulario.intermediario} />
          )}
          <InfoRow label="Conducente" value={formulario.dati_formulario.trasporto.conducente} />
          <InfoRow label="Targa Automezzo" value={formulario.dati_formulario.trasporto.targa_automezzo} />
          {formulario.dati_formulario.trasporto.targa_rimorchio !== 'non presente' && (
            <InfoRow label="Targa Rimorchio" value={formulario.dati_formulario.trasporto.targa_rimorchio} />
          )}
          <InfoRow 
            label="Data/Ora Inizio" 
            value={`${formulario.dati_formulario.trasporto.data_inizio} ${formulario.dati_formulario.trasporto.ora_inizio}`} 
          />
        </InfoCard>

        <InfoCard title="Produttore">
          <InfoRow label="Denominazione" value={formulario.produttore} />
          <InfoRow 
            label="Unità Locale" 
            value={<span className="break-words">{formulario.unita_locale_produttore}</span>} 
          />
        </InfoCard>

        <InfoCard title="Caratteristiche Rifiuto">
          <InfoRow label="Codice EER" value={formulario.dati_formulario.caratteristiche_rifiuto.eer} />
          <InfoRow 
            label="Quantità" 
            value={`${formulario.dati_formulario.caratteristiche_rifiuto.quantita} ${formulario.dati_formulario.caratteristiche_rifiuto.unita_misura}`} 
          />
          <InfoRow label="Stato Fisico" value={formulario.dati_formulario.caratteristiche_rifiuto.stato_fisico} />
          <InfoRow label="Peso Verificato" value={formulario.dati_formulario.caratteristiche_rifiuto.peso_verificato_partenza} />
        </InfoCard>

        <InfoCard title="Accettazione">
          <InfoRow 
            label="Data/Ora Arrivo" 
            value={`${formulario.dati_formulario.destinatario_info.data_arrivo} ${formulario.dati_formulario.destinatario_info.ora_arrivo}`} 
          />
          <InfoRow 
            label="Quantità Accettata" 
            value={`${formulario.dati_formulario.destinatario_info.quantita_accettata} ${formulario.dati_formulario.caratteristiche_rifiuto.unita_misura}`} 
          />
          <InfoRow label="Stato Accettazione" value={formulario.dati_formulario.destinatario_info.carico_accettato} />
          {formulario.dati_formulario.annotazioni && (
            <InfoRow label="Note" value={formulario.dati_formulario.annotazioni} />
          )}
        </InfoCard>
      </div>
    </div>
  );
};

export default FormularioExpanded;