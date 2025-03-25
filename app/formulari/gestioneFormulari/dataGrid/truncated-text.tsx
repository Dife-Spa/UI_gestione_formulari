// dataGrid/truncated-text.tsx
import React from "react";
import { TruncatedTextProps } from "./types";

export function TruncatedText({ text, limit = 25 }: TruncatedTextProps) {
  if (!text) return <span>-</span>;
  
  const shouldTruncate = text.length > limit;
  const truncatedText = shouldTruncate ? `${text.slice(0, limit)}...` : text;
  
  return (
    <span 
      title={shouldTruncate ? text : ""}
      className="cursor-default"
    >
      {truncatedText}
    </span>
  );
}