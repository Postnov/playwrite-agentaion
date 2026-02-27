import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runScript } from '../../src/runner/runner.ts';

describe('runner', () => {
  it('throws when script does not exist', () => {
    expect(() => runScript('/nonexistent/script.ts')).toThrow('Script not found');
  });

  it('runs a valid script successfully', { timeout: 15000 }, () => {
    // Create a temp script that just exits
    const tmpDir = path.resolve('generated');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const tmpScript = path.join(tmpDir, '__test-runner.ts');
    fs.writeFileSync(tmpScript, 'console.log("runner test OK");');

    try {
      runScript(tmpScript);
    } finally {
      fs.unlinkSync(tmpScript);
    }
  });

  it('throws when script has errors', { timeout: 15000 }, () => {
    const tmpDir = path.resolve('generated');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const tmpScript = path.join(tmpDir, '__test-runner-fail.ts');
    fs.writeFileSync(tmpScript, 'process.exit(1);');

    try {
      expect(() => runScript(tmpScript)).toThrow();
    } finally {
      fs.unlinkSync(tmpScript);
    }
  });
});
