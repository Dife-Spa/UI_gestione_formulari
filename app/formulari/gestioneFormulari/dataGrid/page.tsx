// dataGrid/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { DataTable } from "./data-table";
import type { FormularioRecord } from "./types";

export default function Page() {
  const [data, setData] = useState<FormularioRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFormulari = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from("formulari")
        .select(`
          *,
          dati_formulario,
          trasportatore,
          intermediario,
          produttore,
          destinatario,
          unita_locale_produttore,
          unita_locale_destinatario
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (dbData || []).map((record: any): FormularioRecord => ({
        numeroFormulario: record.numeroFir,
        dataEmissione: record.data_emissione?.data_printed || record.data_emissione || "",
        produttore: record.produttore,
        destinatario: record.destinatario,
        trasportatore: record.trasportatore,
        intermediario: record.intermediario,
        idAppuntamento: record.id_appuntamento || "", // Aggiungi questo
        filePaths: {
          formulario: record.file_paths?.formulario,
          scontrino: record.file_paths?.scontrino,
          buono: record.file_paths?.buono_intervento,
        },
        datiFormulario: record.dati_formulario,
      }));
      
      setData(mapped);
    } catch (error) {
      console.error("Error fetching formulari:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carica i dati all'inizio
    fetchFormulari();
    
    // Imposta un intervallo per ricaricare i dati ogni 10 secondi
    const intervalId = setInterval(() => {
      console.log('Ricaricamento periodico dei dati...');
      fetchFormulari();
    }, 10000); // 10 secondi
    
    // Pulizia dell'intervallo quando il componente viene smontato
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Gestione Formulari</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">Caricamento...</div>
          ) : (
            <DataTable data={data} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}