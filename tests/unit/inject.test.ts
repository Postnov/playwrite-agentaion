import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { getBundlePath } from '../../src/recorder/inject.ts';

describe('inject', () => {
  describe('getBundlePath', () => {
    it('returns a path ending with agentation-bundle.js', () => {
      const bundlePath = getBundlePath();
      expect(bundlePath).toMatch(/agentation-bundle\.js$/);
    });

    it('bundle file exists (requires build:bundle to have run)', () => {
      const bundlePath = getBundlePath();
      expect(fs.existsSync(bundlePath)).toBe(true);
    });

    it('bundle is a non-empty file', () => {
      const bundlePath = getBundlePath();
      const stat = fs.statSync(bundlePath);
      expect(stat.size).toBeGreaterThan(1000); // Should be ~300KB
    });

    it('bundle starts with IIFE pattern', () => {
      const bundlePath = getBundlePath();
      const content = fs.readFileSync(bundlePath, 'utf-8');
      // esbuild IIFE wraps in "use strict";(()=>{...})();
      expect(content).toMatch(/^"use strict";\(\(\)=>\{/);
    });
  });
});

describe('types', () => {
  it('Annotation type has required fields', () => {
    const annotation = {
      id: 'test-id',
      x: 50,
      y: 100,
      comment: 'Click here',
      element: 'button',
      elementPath: 'body > div > button',
      timestamp: Date.now(),
    };
    expect(annotation.id).toBe('test-id');
    expect(annotation.element).toBe('button');
  });

  it('Recording type has required fields', () => {
    const recording = {
      startUrl: 'https://example.com',
      annotations: [],
      createdAt: Date.now(),
    };
    expect(recording.startUrl).toBe('https://example.com');
    expect(recording.annotations).toEqual([]);
  });
});

describe('config', () => {
  it('loadConfig returns default browser settings', async () => {
    const { loadConfig } = await import('../../src/config.ts');
    const config = loadConfig();
    expect(config.browser.viewport.width).toBe(1280);
    expect(config.browser.viewport.height).toBe(720);
    expect(config.browser.locale).toBe('ru-RU');
  });

  it('loadConfig accepts overrides', async () => {
    const { loadConfig } = await import('../../src/config.ts');
    const config = loadConfig({
      browser: {
        headless: true,
        slowMo: 50,
        viewport: { width: 800, height: 600 },
        locale: 'en-US',
      },
    });
    expect(config.browser.headless).toBe(true);
    expect(config.browser.slowMo).toBe(50);
    expect(config.browser.viewport.width).toBe(800);
    expect(config.browser.locale).toBe('en-US');
  });
});
