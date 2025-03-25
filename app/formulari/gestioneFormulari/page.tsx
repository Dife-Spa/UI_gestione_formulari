"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
// Change the import to use the FormulariTypes definition
import type { Formulario as FormularioBase } from "@/types/database"
import FormulariTable from "./components/FormulariTable"
import { Formulario } from "./components/FormulariTypes"
import { supabase } from "@/lib/supabase"

export default function Page() {
  // Update the state type to match what your FormulariTable expects
  const [formulari, setFormulari] = useState<Formulario[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFormulari = async () => {
    try {
      const { data, error } = await supabase
        .from('formulari')
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
        .order('created_at', { ascending: false })
  
      if (error) throw error
      
      // Transform the data to match the expected Formulario type
      const typedFormulari = (data || []).map((item: any) => ({
        id: item.id,
        numeroFir: item.numeroFir || '', // Make sure this field name matches exactly what's in your database
        trasportatore: item.trasportatore || '',
        intermediario: item.intermediario || '',
        produttore: item.produttore || '',
        unita_locale_produttore: item.unita_locale_produttore || '',
        destinatario: item.destinatario || '',
        unita_locale_destinatario: item.unita_locale_destinatario || '',
        gestito: item.gestito || false,
        marcaGestito: item.marcaGestito || null,
        file_paths: item.file_paths || {},
        id_appuntamento: item.id_appuntamento || null,
        dati_formulario: item.dati_formulario || {}, // Add the missing property
      }));
      
      setFormulari(typedFormulari)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFormulari()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from('formulari').delete().eq('id', id)
      if (error) throw error
      await fetchFormulari()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleGestione = async (id: number, gestito: boolean) => {
    try {
      const { error } = await supabase
        .from('formulari')
        .update({ 
          gestito: !gestito,
          marcaGestito: !gestito ? new Date().toISOString() : null
        })
        .eq('id', id)
      if (error) throw error
      await fetchFormulari()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDownload = async (path: string) => {
    try {
      const { data } = supabase.storage.from('documenti').getPublicUrl(path)
      if (data.publicUrl) {
        const response = await fetch(data.publicUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', path.split('/').pop() || 'download.pdf')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

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
            <div className="flex items-center justify-center h-full">
              Caricamento...
            </div>
          ) : (
            <FormulariTable
              formulari={formulari}
              onDelete={handleDelete}
              onGestione={handleGestione}
              onDownload={handleDownload}
              loading={loading}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}