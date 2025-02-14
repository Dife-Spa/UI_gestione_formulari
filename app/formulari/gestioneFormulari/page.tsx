"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/date-range-picker"
import { Search, Upload, MoreVertical, FileDown, Eye, Trash2, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Formulario } from "@/types/database"

export default function Page() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [formulari, setFormulari] = useState<Formulario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGestiti, setFilterGestiti] = useState<'tutti' | 'gestiti' | 'daGestire'>('tutti')
  const [dateFilter, setDateFilter] = useState<DateRange>()

  const fetchFormulari = async () => {
    try {
      const { data, error } = await supabase
        .from('formulari')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFormulari(data || [])
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
      const { error } = await supabase
        .from('formulari')
        .delete()
        .eq('id', id)

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

  const filterByDate = (formulario: Formulario) => {
    if (!dateFilter?.from) return true
    
    const createdAt = new Date(formulario.created_at)
    
    if (dateFilter.from && !dateFilter.to) {
      return createdAt.toDateString() === dateFilter.from.toDateString()
    }
    
    if (dateFilter.from && dateFilter.to) {
      const end = new Date(dateFilter.to)
      end.setHours(23, 59, 59, 999)
      return createdAt >= dateFilter.from && createdAt <= end
    }
    
    return true
  }

  const filteredFormulari = formulari
    .filter(f => f.numeroFir.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(f => {
      switch (filterGestiti) {
        case 'gestiti':
          return f.gestito
        case 'daGestire':
          return !f.gestito
        default:
          return true
      }
    })
    .filter(filterByDate)

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
                  <BreadcrumbLink href="/documenti">Documenti</BreadcrumbLink>
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
              <div className="flex justify-between items-center">
                <CardTitle>Gestione Formulari</CardTitle>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Carica Nuovo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Carica Formulario</DialogTitle>
                      <DialogDescription>
                        Seleziona il file PDF del formulario da caricare
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Input type="file" accept=".pdf" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                        Annulla
                      </Button>
                      <Button onClick={() => setIsUploadOpen(false)}>
                        Carica
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtri */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca per numero FIR..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select 
                    value={filterGestiti}
                    onValueChange={(value) => setFilterGestiti(value as 'tutti' | 'gestiti' | 'daGestire')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutti">Tutti</SelectItem>
                      <SelectItem value="gestiti">Gestiti</SelectItem>
                      <SelectItem value="daGestire">Da Gestire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <DateRangePicker onChange={setDateFilter} />

                <div className="text-sm text-muted-foreground">
                  {filteredFormulari.length} risultat{filteredFormulari.length === 1 ? 'o' : 'i'} 
                  {filteredFormulari.length !== formulari.length && ` su ${formulari.length} totali`}
                </div>
              </div>

              {/* Tabella */}
              {loading ? (
                <div className="text-center py-4">Caricamento...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero FIR</TableHead>
                      <TableHead>Data Inserimento</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Documenti</TableHead>
                      <TableHead className="w-[100px]">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFormulari.map((formulario) => (
                      <TableRow key={formulario.id}>
                        <TableCell className="font-medium">
                          {formulario.numeroFir}
                        </TableCell>
                        <TableCell>
                          {new Date(formulario.created_at).toLocaleString('it-IT')}
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
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                FIR
                              </Button>
                            )}
                            {formulario.file_paths?.buono_intervento && (
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Buono
                              </Button>
                            )}
                            {formulario.file_paths?.scontrino && (
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Scontrino
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {formulario.file_paths?.formulario && (
                                <DropdownMenuItem>
                                  <FileDown className="mr-2 h-4 w-4" />
                                  Scarica
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleGestione(formulario.id, formulario.gestito)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {formulario.gestito ? 'Marca come da gestire' : 'Marca come gestito'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(formulario.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}