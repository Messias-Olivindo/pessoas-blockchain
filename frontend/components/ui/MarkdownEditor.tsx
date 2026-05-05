"use client";

import { useState } from "react";
import { MarkdownViewer } from "./MarkdownViewer";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, className = "" }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className={`flex flex-col border-[3px] border-[var(--color-tertiary-bg)] rounded-[20px] overflow-hidden ${className}`}>
      <div className="flex bg-[var(--color-secondary-bg)] border-b-[3px] border-[var(--color-tertiary-bg)]">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`px-4 py-2 font-bold text-sm ${!isPreview ? "bg-[var(--color-primary-bg)] text-[var(--color-accent-blue)]" : "text-[var(--color-text-main)] opacity-70 hover:opacity-100"}`}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`px-4 py-2 font-bold text-sm border-l-[3px] border-[var(--color-tertiary-bg)] ${isPreview ? "bg-[var(--color-primary-bg)] text-[var(--color-accent-blue)]" : "text-[var(--color-text-main)] opacity-70 hover:opacity-100"}`}
        >
          Visualizar
        </button>
      </div>
      
      <div className="bg-[var(--color-primary-bg)] p-4 min-h-[200px]">
        {isPreview ? (
          <MarkdownViewer content={value} />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Suporta Markdown (ex: **negrito**, - lista)"}
            className="w-full h-full min-h-[180px] bg-transparent text-[var(--color-text-main)] focus:outline-none resize-y"
          />
        )}
      </div>
    </div>
  );
}
