import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'ru-RU',
  });
  const page = await context.newPage();

  try {
    // 1. Открываем сайт
    await page.goto('https://dev-postnov.ru', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // 2. Клик на кнопку "Поиск"
    await page.waitForSelector('#search-open', { timeout: 10000 });
    await page.click('#search-open');
    await page.waitForTimeout(500);

    // 3. Вводим «НДА» в поле поиска и ждём результатов
    await page.waitForSelector('#search-input', { timeout: 5000 });
    await page.fill('#search-input', 'НДА');
    await page.waitForSelector('.search-result-item', { timeout: 5000 });

    // 4. Кликаем на ссылку «Решаем проблему НДА»
    await page.click('.search-result-title');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 5. Скроллим вниз к кнопке «Уважаемо» и кликаем
    await page.waitForSelector('.respect-btn', { timeout: 10000 });
    await page.locator('.respect-btn').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.click('.respect-btn');
    await page.waitForTimeout(1000);

    console.log('Готово! Поиск → НДА → Уважаемо — выполнено.');
  } catch (e) {
    console.error('Ошибка:', (e as Error).message);
  } finally {
    await browser.close();
  }
}

main();
