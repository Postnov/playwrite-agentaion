import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function buildBundle() {
  const result = await build({
    entryPoints: [path.join(root, 'scripts/agentation-mount.tsx')],
    bundle: true,
    format: 'iife',
    outfile: path.join(root, 'dist/agentation-bundle.js'),
    minify: true,
    target: 'es2020',
    jsx: 'automatic',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    // Bundle everything — no externals
    external: [],
    logLevel: 'info',
  });

  if (result.errors.length > 0) {
    console.error('Build failed:', result.errors);
    process.exit(1);
  }

  console.log('Bundle built: dist/agentation-bundle.js');
}

buildBundle().catch((err) => {
  console.error('Build error:', err);
  process.exit(1);
});
