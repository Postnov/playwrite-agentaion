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
  })
);

// ── "Copy JSON" button ──
const btn = document.createElement('button');
btn.id = '__maputo-copy-json-btn';
btn.textContent = 'Copy JSON';
btn.title = 'Copy all annotations from all pages to clipboard';

Object.assign(btn.style, {
  position: 'fixed',
  bottom: '16px',
  left: '16px',
  zIndex: '2147483646',
  padding: '8px 16px',
  background: '#1a1a2e',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  transition: 'background 0.2s, transform 0.1s',
});

btn.addEventListener('mouseenter', () => {
  btn.style.background = '#2a2a4e';
  btn.style.transform = 'scale(1.03)';
});
btn.addEventListener('mouseleave', () => {
  btn.style.background = '#1a1a2e';
  btn.style.transform = 'scale(1)';
});

btn.addEventListener('click', async () => {
  try {
    const json = await window.__maputo_getAllAnnotations?.();
    if (!json) {
      showFeedback('No annotations yet', '#f59e0b');
      return;
    }

    const annotations = JSON.parse(json);
    if (annotations.length === 0) {
      showFeedback('No annotations yet', '#f59e0b');
      return;
    }

    await navigator.clipboard.writeText(JSON.stringify(annotations, null, 2));
    showFeedback(`Copied ${annotations.length} annotations`, '#10b981');
  } catch (err) {
    console.error('[Maputo] Copy failed:', err);
    showFeedback('Copy failed', '#ef4444');
  }
});

function showFeedback(text: string, color: string) {
  const original = btn.textContent;
  btn.textContent = text;
  btn.style.background = color;
  setTimeout(() => {
    btn.textContent = original;
    btn.style.background = '#1a1a2e';
  }, 1500);
}

document.body.appendChild(btn);
