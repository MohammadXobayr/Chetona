import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse paragraphs, headers, quotes, lists and code blocks simply & safely
  const renderFormattedText = (text: string) => {
    // Break into lines
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    const flushList = (key: number) => {
      if (!currentList) return null;
      const listType = currentList.type;
      const items = [...currentList.items];
      currentList = null;

      if (listType === 'ul') {
        return (
          <ul key={`list-${key}`} className="my-2.5 space-y-1.5 list-disc pl-5 text-[#27272A]">
            {items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        return (
          <ol key={`list-${key}`} className="my-2.5 space-y-1.5 list-decimal pl-5 text-[#27272A]">
            {items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ol>
        );
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Code blocks ```
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="my-3 overflow-x-auto rounded-lg bg-[#18181B] p-3 text-xs text-[#E4E4E7] font-mono leading-relaxed"
            >
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          if (currentList) {
            elements.push(flushList(index));
          }
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Check unordered list item (* or -)
      if (/^[-*•]\s+/.test(trimmed)) {
        const itemContent = trimmed.replace(/^[-*•]\s+/, '');
        if (!currentList || currentList.type !== 'ul') {
          if (currentList) elements.push(flushList(index));
          currentList = { type: 'ul', items: [itemContent] };
        } else {
          currentList.items.push(itemContent);
        }
        return;
      }

      // Check ordered list item (1., 2., etc)
      if (/^\d+[.)]\s+/.test(trimmed)) {
        const itemContent = trimmed.replace(/^\d+[.)]\s+/, '');
        if (!currentList || currentList.type !== 'ol') {
          if (currentList) elements.push(flushList(index));
          currentList = { type: 'ol', items: [itemContent] };
        } else {
          currentList.items.push(itemContent);
        }
        return;
      }

      // If not a list item, flush any existing list
      if (currentList) {
        elements.push(flushList(index));
      }

      // Empty line / paragraph break
      if (!trimmed) {
        elements.push(<div key={`empty-${index}`} className="h-2" />);
        return;
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        const quoteContent = trimmed.replace(/^>\s*/, '');
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="my-2 border-l-2 border-[#006A4E] pl-3.5 italic text-[#4B5563] text-sm leading-relaxed"
          >
            {parseInlineFormatting(quoteContent)}
          </blockquote>
        );
        return;
      }

      // Normal paragraph line
      elements.push(
        <p key={`p-${index}`} className="leading-relaxed text-[#202023] mb-1.5 last:mb-0">
          {parseInlineFormatting(line)}
        </p>
      );
    });

    if (currentList) {
      elements.push(flushList(lines.length));
    }

    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <pre
          key={`code-end`}
          className="my-3 overflow-x-auto rounded-lg bg-[#18181B] p-3 text-xs text-[#E4E4E7] font-mono leading-relaxed"
        >
          <code>{codeBlockContent.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  const parseInlineFormatting = (text: string): React.ReactNode[] => {
    // Parse bold **text**, inline `code`, and italics *text*
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchStr = match[0];
      if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-semibold text-[#111827]">
            {matchStr.slice(2, -2)}
          </strong>
        );
      } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            className="rounded bg-[#000000]/6 px-1.5 py-0.5 font-mono text-[0.85em] text-[#111827]"
          >
            {matchStr.slice(1, -1)}
          </code>
        );
      } else if (matchStr.startsWith('*') && matchStr.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-[#374151]">
            {matchStr.slice(1, -1)}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return <div className="space-y-1">{renderFormattedText(content)}</div>;
};
