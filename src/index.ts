import { startRecording } from './recorder/recorder.ts';
import { runScript } from './runner/runner.ts';

function printUsage(): void {
  console.log(`
Maputo — Browser annotation recorder for automation development

Usage:
  npx tsx src/index.ts record [--url <url>]
  npx tsx src/index.ts run --script <file>

Commands:
  record    Open browser with Agentation UI, annotate elements, save to JSON
  run       Execute a Playwright script from generated/

Options:
  --url     Starting URL (optional — without it opens a welcome page)
  --script  Path to the Playwright script to run

Workflow:
  1. record  → Open browser, annotate elements → recordings/*.json
  2. Copy annotations (copy button in toolbar) → paste into AI chat → get Playwright script
  3. Save script to generated/*.ts
  4. run     → Execute the script
`);
}

function parseArgs(args: string[]): { command: string; options: Record<string, string> } {
  const command = args[0] || '';
  const options: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--') && args[i + 1]) {
      options[args[i].slice(2)] = args[++i];
    }
  }

  return { command, options };
}

async function main(): Promise<void> {
  const { command, options } = parseArgs(process.argv.slice(2));

  switch (command) {
    case 'record': {
      const filepath = await startRecording(options.url);
      if (filepath) {
        console.log(`\nRecording saved to: ${filepath}`);
        console.log('Next: paste the copied annotations into your AI chat to generate a Playwright script.');
      }
      break;
    }

    case 'run': {
      if (!options.script) {
        console.error('Error: --script is required for run command');
        console.error('Example: npx tsx src/index.ts run --script generated/my-script.ts');
        process.exit(1);
      }
      runScript(options.script);
      break;
    }

    default:
      printUsage();
      if (command && command !== 'help' && command !== '--help') {
        console.error(`Unknown command: ${command}`);
        process.exit(1);
      }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
