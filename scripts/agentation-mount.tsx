import React from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

declare global {
  interface Window {
    __maputo_onAnnotationAdd?: (json: string) => void;
    __maputo_onAnnotationDelete?: (json: string) => void;
    __maputo_onAnnotationUpdate?: (json: string) => void;
    __maputo_onSubmit?: (markdown: string, annotationsJson: string) => void;
    __maputo_getAllAnnotations?: () => Promise<string>;
  }
}

// ── Agentation UI ──
const container = document.createElement('div');
container.id = '__maputo-agentation-root';
document.body.appendChild(container);

const root = createRoot(container);
root.render(
  React.createElement(Agentation, {
    onAnnotationAdd: (annotation: unknown) => {
      window.__maputo_onAnnotationAdd?.(JSON.stringify(annotation));
    },
    onAnnotationDelete: (annotation: unknown) => {
      window.__maputo_onAnnotationDelete?.(JSON.stringify(annotation));
    },
    onAnnotationUpdate: (annotation: unknown) => {
      window.__maputo_onAnnotationUpdate?.(JSON.stringify(annotation));
    },
    onSubmit: (markdown: string, annotations: unknown[]) => {
      window.__maputo_onSubmit?.(markdown, JSON.stringify(annotations));
    },
    copyToClipboard: false,
    onCopy: async () => {
      try {
        const json = await window.__maputo_getAllAnnotations?.();
        if (!json) return;
        const annotations = JSON.parse(json);
        if (annotations.length === 0) return;
        await navigator.clipboard.writeText(JSON.stringify(annotations, null, 2));
      } catch (err) {
        console.error('[Maputo] Copy failed:', err);
      }
    },
  })
);
