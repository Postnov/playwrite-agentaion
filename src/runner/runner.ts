import { execSync } from 'child_process';
import fs from 'fs';
import { log } from '../utils/logger.ts';

/**
 * Run a generated Playwright script via tsx.
 */
export function runScript(scriptPath: string): void {
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`Script not found: ${scriptPath}`);
  }

  log.info(`Running script: ${scriptPath}`);

  try {
    execSync(`npx tsx "${scriptPath}"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    log.success('Script finished successfully');
  } catch (e) {
    const msg = (e as Error).message;
    log.error(`Script failed: ${msg}`);
    throw e;
  }
}
