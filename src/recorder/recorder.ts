import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import type { Page } from 'playwright';
import { launch, close } from '../browser/browser-manager.ts';
import { loadConfig, type Config } from '../config.ts';
import { injectAgentation } from './inject.ts';
import { log } from '../utils/logger.ts';
import type { Annotation, RecordedStep, Recording } from '../types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECORDINGS_DIR = path.resolve(__dirname, '../../recordings');

function ensureRecordingsDir(): void {
  if (!fs.existsSync(RECORDINGS_DIR)) {
    fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
  }
}

function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

export async function startRecording(
  url: string,
  configOverrides?: Partial<Config>,
): Promise<string> {
  const config = loadConfig(configOverrides);
  ensureRecordingsDir();

  log.info(`Starting recording session`);
  log.info(`URL: ${url}`);

  // Launch browser
  const page = await launch(config);

  // Track annotations for current step
  let currentAnnotations: Annotation[] = [];

  // Inject Agentation UI with callbacks
  const setupPage = async (p: Page) => {
    await p.waitForLoadState('domcontentloaded');
    await injectAgentation(p, {
      onAnnotationAdd: (annotation) => {
        currentAnnotations.push(annotation);
        log.info(`Annotation added: ${annotation.element} — "${annotation.comment || '(no comment)'}"`);
      },
      onAnnotationDelete: (annotation) => {
        currentAnnotations = currentAnnotations.filter((a) => a.id !== annotation.id);
        log.info(`Annotation removed: ${annotation.element}`);
      },
      onAnnotationUpdate: (annotation) => {
        const idx = currentAnnotations.findIndex((a) => a.id === annotation.id);
        if (idx >= 0) currentAnnotations[idx] = annotation;
        log.info(`Annotation updated: ${annotation.element}`);
      },
      onSubmit: (markdown, annotations) => {
        log.info(`Submit received — ${annotations.length} annotations`);
        log.info(`Markdown preview:\n${markdown.slice(0, 200)}...`);
      },
    });
  };

  // Navigate and inject
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await setupPage(page);

  // Re-inject on navigation
  page.on('load', async () => {
    try {
      await setupPage(page);
    } catch {
      // May fail if page is closing — ignore
    }
  });

  // Recording loop
  const steps: RecordedStep[] = [];
  const rl = createReadlineInterface();
  let stepNumber = 1;

  log.success('Recording started! Agentation UI should be visible in the browser.');
  console.log('');
  console.log('Commands:');
  console.log('  Enter     — Save current step and start next');
  console.log('  q + Enter — Finish recording and save');
  console.log('');

  let running = true;
  while (running) {
    const input = await askQuestion(
      rl,
      `\n[Step ${stepNumber}] Annotate elements, then press Enter (or 'q' to finish): `,
    );

    if (input.toLowerCase() === 'q') {
      // Save remaining annotations as last step if any
      if (currentAnnotations.length > 0) {
        const action = await askQuestion(rl, 'Describe this final step: ');
        steps.push({
          stepNumber,
          url: page.url(),
          action,
          annotations: [...currentAnnotations],
        });
        log.action(`Step ${stepNumber} saved: "${action}" (${currentAnnotations.length} annotations)`);
      }
      running = false;
      break;
    }

    if (currentAnnotations.length === 0) {
      log.info('No annotations yet. Add some in the browser, then press Enter.');
      continue;
    }

    const action = await askQuestion(rl, 'Describe this step: ');

    steps.push({
      stepNumber,
      url: page.url(),
      action,
      annotations: [...currentAnnotations],
    });

    log.action(`Step ${stepNumber} saved: "${action}" (${currentAnnotations.length} annotations)`);
    currentAnnotations = [];
    stepNumber++;
  }

  rl.close();

  // Save recording
  const recording: Recording = {
    startUrl: url,
    steps,
    createdAt: Date.now(),
  };

  const filename = `recording-${Date.now()}.json`;
  const filepath = path.join(RECORDINGS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(recording, null, 2));

  log.success(`Recording saved: ${filepath}`);
  log.info(`Total steps: ${steps.length}`);

  // Close browser
  await close();

  return filepath;
}
