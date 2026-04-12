import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import katex from 'katex';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Render block math $$ ... $$
    let result = value.replace(/\$\$([^$]+)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch { return _; }
    });

    // Render inline math $ ... $
    result = result.replace(/\$([^$\n]+)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch { return _; }
    });

    // Keep DOMPurify but allow KaTeX classes/styles through
    return DOMPurify.sanitize(marked.parse(result) as string, {
      ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'msubsup', 'annotation'],
      ADD_ATTR: ['class', 'style', 'xmlns', 'encoding']
    });
  }
}