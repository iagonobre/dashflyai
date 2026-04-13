"use client";

import { useEffect, useRef } from "react";
import Spinner from "@/components/ui/Spinner";

interface Props {
  value: string;
  onChange: (value: string) => void;
  isStreaming: boolean;
  placeholder?: string;
  rows?: number;
}

export default function StreamingText({
  value,
  onChange,
  isStreaming,
  placeholder,
  rows = 6,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll para o final durante streaming
  useEffect(() => {
    if (isStreaming && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [value, isStreaming]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={isStreaming}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-container border border-border rounded-lg px-4 py-3 text-white
          placeholder:text-darkText focus:outline-none focus:border-primaryStroke
          text-sm resize-none transition-colors disabled:opacity-60"
      />
      {isStreaming && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 text-darkText text-xs">
          <Spinner size="sm" />
          <span>Gerando...</span>
        </div>
      )}
    </div>
  );
}
