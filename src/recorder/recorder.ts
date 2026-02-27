import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { launch, close } from '../browser/browser-manager.ts';
import { loadConfig, type Config } from '../config.ts';
import { injectAgentation } from './inject.ts';
import { log } from '../utils/logger.ts';
import type { Annotation, Recording } from '../types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECORDINGS_DIR = path.resolve(__dirname, '../../recordings');
const WELCOME_PAGE = path.resolve(__dirname, 'welcome.html');

function ensureRecordingsDir(): void {
  if (!fs.existsSync(RECORDINGS_DIR)) {
    fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
  }
}

function waitForQuit(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onData = (key: string) => {
      // q or Ctrl+C
      if (key === 'q' || key === '\u0003') {
        process.stdin.setRawMode?.(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        resolve();
      }
    };

    process.stdin.on('data', onData);
  });
}

export async function startRecording(
  url?: string,
  configOverrides?: Partial<Config>,
): Promise<string> {
  const config = loadConfig(configOverrides);
  ensureRecordingsDir();

  log.info(`Starting recording session`);

  const page = await launch(config);

  // All annotations collected across all pages
  const allAnnotations: Annotation[] = [];

  // Track current page URL for each annotation
  let currentUrl = url || '';

  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      currentUrl = page.url();
    }
  });

  // Navigate to URL or welcome page
  if (url) {
    log.info(`URL: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } else {
    log.info('No URL specified — opening welcome page');
    await page.goto(`file://${WELCOME_PAGE}`, { waitUntil: 'domcontentloaded' });
  }

  // Inject Agentation UI + auto-reinject on navigation
  await injectAgentation(page, {
    onAnnotationAdd: (annotation) => {
      const enriched: Annotation = { ...annotation, url: currentUrl };
      allAnnotations.push(enriched);
      log.info(`[${allAnnotations.length}] ${annotation.element} — "${annotation.comment || '(no comment)'}"`);
    },
    onAnnotationDelete: (annotation) => {
      const idx = allAnnotations.findIndex((a) => a.id === annotation.id);
      if (idx >= 0) {
        allAnnotations.splice(idx, 1);
        log.info(`Removed: ${annotation.element}`);
      }
    },
    onAnnotationUpdate: (annotation) => {
      const idx = allAnnotations.findIndex((a) => a.id === annotation.id);
      if (idx >= 0) {
        allAnnotations[idx] = { ...annotation, url: allAnnotations[idx].url };
        log.info(`Updated: ${annotation.element}`);
      }
    },
    onSubmit: () => {
      // Not used — we collect everything ourselves
    },
    getAllAnnotations: () => allAnnotations,
  });

  log.success('Recording started!');
  console.log('');
  if (!url) {
    console.log('  Navigate to any website in the browser — Agentation will appear automatically.');
  } else {
    console.log('  Annotate elements in the browser. Navigate freely between pages.');
  }
  console.log('  Press the copy button in Agentation toolbar or Q in terminal to finish.');
  console.log('');

  // Wait for user to press Q
  await waitForQuit();

  console.log('');

  if (allAnnotations.length === 0) {
    log.info('No annotations recorded.');
    await close();
    return '';
  }

  // Save recording
  const startUrl = url || allAnnotations[0]?.url || '';
  const recording: Recording = {
    startUrl,
    annotations: allAnnotations,
    createdAt: Date.now(),
  };

  const ts = Date.now();
  const jsonPath = path.join(RECORDINGS_DIR, `recording-${ts}.json`);
  const mdPath = path.join(RECORDINGS_DIR, `recording-${ts}.md`);

  fs.writeFileSync(jsonPath, JSON.stringify(recording, null, 2));

  const markdown = formatRecordingMarkdown(recording);
  fs.writeFileSync(mdPath, markdown);

  log.success(`Recording saved! (${allAnnotations.length} annotations)`);
  log.info(`JSON: ${jsonPath}`);
  log.info(`Markdown: ${mdPath}`);

  // Print markdown for easy copy
  console.log('\n' + '='.repeat(60));
  console.log('  COPY THIS INTO AI CHAT:');
  console.log('='.repeat(60) + '\n');
  console.log(markdown);
  console.log('='.repeat(60) + '\n');

  await close();

  return jsonPath;
}

function formatRecordingMarkdown(recording: Recording): string {
  const lines: string[] = [];

  lines.push(`## Recording: ${recording.startUrl}`);
  lines.push('');

  // Group annotations by page URL (preserve order)
  const pageGroups: { url: string; annotations: Annotation[] }[] = [];
  for (const ann of recording.annotations) {
    const last = pageGroups[pageGroups.length - 1];
    if (last && last.url === ann.url) {
      last.annotations.push(ann);
    } else {
      pageGroups.push({ url: ann.url, annotations: [ann] });
    }
  }

  let globalIndex = 1;
  for (const group of pageGroups) {
    lines.push(`**Page:** ${group.url}`);
    lines.push('');

    for (const ann of group.annotations) {
      lines.push(`### ${globalIndex}. ${ann.element}`);
      lines.push(`**Selector:** \`${ann.elementPath}\``);
      if (ann.comment) lines.push(`**Action:** ${ann.comment}`);
      if (ann.nearbyText) lines.push(`**Nearby text:** ${ann.nearbyText}`);
      if (ann.cssClasses) lines.push(`**Classes:** \`${ann.cssClasses}\``);
      if (ann.selectedText) lines.push(`**Selected text:** "${ann.selectedText}"`);
      if (ann.accessibility) lines.push(`**Accessibility:** ${ann.accessibility}`);
      lines.push('');
      globalIndex++;
    }
  }

  return lines.join('\n');
}
