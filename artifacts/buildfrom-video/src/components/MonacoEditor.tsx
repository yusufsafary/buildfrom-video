import { useEffect, useRef } from 'react';

interface MonacoEditorProps {
  value: string;
  language: string;
  className?: string;
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    require: any;
    monaco: any;
  }
}

export function MonacoEditor({ value, language, className = '', theme = 'light' }: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initMonaco = () => {
      if (!isMounted || !containerRef.current) return;
      
      if (!window.monaco) {
        if (!document.getElementById('monaco-loader')) {
          const script = document.createElement('script');
          script.id = 'monaco-loader';
          script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
          script.onload = () => {
            window.require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
            window.require(['vs/editor/editor.main'], () => {
              if (isMounted) initEditor();
            });
          };
          document.body.appendChild(script);
        } else {
          // Loader exists but monaco not ready yet, wait a bit
          setTimeout(initMonaco, 100);
        }
        return;
      }

      initEditor();
    };

    const initEditor = () => {
      if (editorRef.current) {
        editorRef.current.setValue(value);
        window.monaco.editor.setModelLanguage(editorRef.current.getModel(), language);
        window.monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
        return;
      }

      if (containerRef.current && window.monaco) {
        editorRef.current = window.monaco.editor.create(containerRef.current, {
          value,
          language,
          theme: theme === 'dark' ? 'vs-dark' : 'vs',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly: true,
          fontSize: 13,
          fontFamily: 'JetBrains Mono, monospace',
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'off',
          glyphMargin: false,
          folding: false,
        });
      }
    };

    initMonaco();

    return () => {
      isMounted = false;
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [value, language, theme]);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}
