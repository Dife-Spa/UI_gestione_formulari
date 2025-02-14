// components/ui/document-button.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DocumentButtonProps {
  path: string
  label: string
  variant?: "fir" | "buono" | "scontrino"
}

export function DocumentButton({ path, label, variant = "fir" }: DocumentButtonProps) {
  const handleClick = async () => {
    try {
      const { data, error } = await supabase
        .storage
        .from('documenti')
        .createSignedUrl(path, 60)

      if (error) throw error
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const colorVariants = {
    fir: "border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500",
    buono: "border-emerald-500 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-500",
    scontrino: "border-amber-500 text-amber-500 hover:bg-amber-50 hover:text-amber-500 hover:border-amber-500"
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={colorVariants[variant]}
    >
      <Eye className="h-4 w-4 mr-1" />
      {label}
    </Button>
  )
}