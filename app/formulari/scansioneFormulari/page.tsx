// app/formulari/scansione-formulari/page.tsx
"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "./components/file-upload"
import { PreviewFormulari } from "./components/preview-formulari"

export default function ScanPage() {
  const [results, setResults] = useState<any>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const fetchResults = async () => {
    try {
      const response = await fetch('/formulari/scansioneFormulari/api/working-results')
      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error('Errore nel recupero dei risultati:', err)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [])

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(prev => {
      const existingFileNames = prev.map(f => f.name)
      const newFiles = files.filter(f => !existingFileNames.includes(f.name))
      return [...prev, ...newFiles]
    })
  }

  const handleNewResults = (newResults: any) => {
    setResults(newResults)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/formulari">Formulari</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Scansione Formulari</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Scansione Formulari</CardTitle>
            </CardHeader>
            <CardContent>
              <section className="mb-8">
                <FileUpload 
                  onFilesUploaded={handleFilesUploaded}
                  onProcessingComplete={handleNewResults}
                />
              </section>

              {results && (
                <section className="mb-8">
                  <PreviewFormulari 
                    results={results}
                  />
                </section>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}