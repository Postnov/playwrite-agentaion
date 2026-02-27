import type { Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Annotation } from '../types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE_PATH = path.resolve(__dirname, '../../dist/agentation-bundle.js');

export interface InjectionCallbacks {
  onAnnotationAdd: (annotation: Annotation) => void;
  onAnnotationDelete: (annotation: Annotation) => void;
  onAnnotationUpdate: (annotation: Annotation) => void;
  onSubmit: (markdown: string, annotations: Annotation[]) => void;
}

/**
 * Inject the Agentation UI bundle into a Playwright page.
 * Sets up bridge functions so annotation events flow from browser to Node.js.
 */
export async function injectAgentation(page: Page, callbacks: InjectionCallbacks): Promise<void> {
  if (!fs.existsSync(BUNDLE_PATH)) {
    throw new Error(
      `Agentation bundle not found at ${BUNDLE_PATH}. Run "npm run build:bundle" first.`
    );
  }

  // Expose bridge functions BEFORE injecting the script
  await page.exposeFunction('__maputo_onAnnotationAdd', (json: string) => {
    callbacks.onAnnotationAdd(JSON.parse(json));
  });

  await page.exposeFunction('__maputo_onAnnotationDelete', (json: string) => {
    callbacks.onAnnotationDelete(JSON.parse(json));
  });

  await page.exposeFunction('__maputo_onAnnotationUpdate', (json: string) => {
    callbacks.onAnnotationUpdate(JSON.parse(json));
  });

  await page.exposeFunction('__maputo_onSubmit', (markdown: string, annotationsJson: string) => {
    callbacks.onSubmit(markdown, JSON.parse(annotationsJson));
  });

  // Inject the bundle
  const bundleCode = fs.readFileSync(BUNDLE_PATH, 'utf-8');
  await page.addScriptTag({ content: bundleCode });
}

/**
 * Get the path to the Agentation bundle file.
 */
export function getBundlePath(): string {
  return BUNDLE_PATH;
}
