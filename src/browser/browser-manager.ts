import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import type { Config } from '../config.ts';

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

export async function launch(config: Config): Promise<Page> {
  browser = await chromium.launch({
    headless: config.browser.headless,
    slowMo: config.browser.slowMo,
  });

  context = await browser.newContext({
    viewport: config.browser.viewport,
    locale: config.browser.locale,
  });

  page = await context.newPage();
  return page;
}

export function getPage(): Page {
  if (!page) throw new Error('Browser not launched. Call launch() first.');
  return page;
}

export async function close(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    context = null;
    page = null;
  }
}
