// dataGrid/copy-button.tsx
"use client";

import React from "react";
import { Copy } from "lucide-react"; // Assumo che tu stia usando lucide-react per le icone

interface CopyButtonProps {
  text: string;
  size?: "small" | "normal";
  className?: string;
}

export function CopyButton({ text, size = "normal", className = "" }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const iconSize = size === "small" ? 14 : 18;
  const baseClasses = "hover:bg-gray-100 p-1 rounded-md cursor-pointer transition-colors";
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <span className={combinedClasses} onClick={handleCopy} title="Copia negli appunti">
      <Copy size={iconSize} />
    </span>
  );
}