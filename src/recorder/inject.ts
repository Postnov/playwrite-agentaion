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

let bundleCode: string | null = null;

function loadBundle(): string {
  if (!bundleCode) {
    if (!fs.existsSync(BUNDLE_PATH)) {
      throw new Error(
        `Agentation bundle not found at ${BUNDLE_PATH}. Run "npm run build:bundle" first.`
      );
    }
    bundleCode = fs.readFileSync(BUNDLE_PATH, 'utf-8');
  }
  return bundleCode;
}

/**
 * Set up bridge functions (browser → Node.js) once per page.
 * exposeFunction persists across navigations, so call this only once.
 */
export async function setupBridge(page: Page, callbacks: InjectionCallbacks): Promise<void> {
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
}

/**
 * Inject the Agentation UI bundle into the current page.
 * Safe to call multiple times (after each navigation).
 */
export async function injectBundle(page: Page): Promise<void> {
  const code = loadBundle();
  await page.addScriptTag({ content: code });
}

/**
 * Full setup: bridge + injection + auto-reinject on navigation.
 */
export async function injectAgentation(page: Page, callbacks: InjectionCallbacks): Promise<void> {
  // 1. Bridge — once
  await setupBridge(page, callbacks);

  // 2. Inject bundle into current page
  await injectBundle(page);

  // 3. Auto-reinject on every subsequent navigation
  page.on('load', async () => {
    try {
      await injectBundle(page);
    } catch {
      // Page may be closing — ignore
    }
  });
}

/**
 * Get the path to the Agentation bundle file.
 */
export function getBundlePath(): string {
  return BUNDLE_PATH;
}
