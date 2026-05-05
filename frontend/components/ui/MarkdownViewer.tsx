import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  return (
    <div className={`prose prose-invert max-w-none text-[#e8f1f2] ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || "*Nenhum conteúdo adicionado.*"}
      </ReactMarkdown>
    </div>
  );
}
