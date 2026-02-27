import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
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

  // Navigate to start URL
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Inject Agentation UI with callbacks + auto-reinject on navigation
  await injectAgentation(page, {
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
  log.info('Agentation will persist across page navigations.');

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

  const ts = Date.now();
  const jsonFile = `recording-${ts}.json`;
  const mdFile = `recording-${ts}.md`;
  const jsonPath = path.join(RECORDINGS_DIR, jsonFile);
  const mdPath = path.join(RECORDINGS_DIR, mdFile);

  fs.writeFileSync(jsonPath, JSON.stringify(recording, null, 2));

  // Generate combined markdown with all steps from all pages
  const markdown = formatRecordingMarkdown(recording);
  fs.writeFileSync(mdPath, markdown);

  log.success(`Recording saved!`);
  log.info(`JSON: ${jsonPath}`);
  log.info(`Markdown: ${mdPath}`);
  log.info(`Total steps: ${steps.length}`);

  // Print markdown to terminal for easy copy
  console.log('\n' + '='.repeat(60));
  console.log('  COPY THIS INTO AI CHAT:');
  console.log('='.repeat(60) + '\n');
  console.log(markdown);
  console.log('='.repeat(60) + '\n');

  // Close browser
  await close();

  return jsonPath;
}

function formatRecordingMarkdown(recording: Recording): string {
  const lines: string[] = [];

  lines.push(`## Recording: ${recording.startUrl}`);
  lines.push('');

  for (const step of recording.steps) {
    lines.push(`### Step ${step.stepNumber}. ${step.action}`);
    lines.push(`**Page:** ${step.url}`);
    lines.push('');

    for (const ann of step.annotations) {
      lines.push(`- **${ann.element}** — "${ann.comment || ''}"`);
      lines.push(`  **Selector:** \`${ann.elementPath}\``);
      if (ann.nearbyText) lines.push(`  **Nearby text:** ${ann.nearbyText}`);
      if (ann.cssClasses) lines.push(`  **Classes:** \`${ann.cssClasses}\``);
      if (ann.selectedText) lines.push(`  **Selected text:** "${ann.selectedText}"`);
      if (ann.accessibility) lines.push(`  **Accessibility:** ${ann.accessibility}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
