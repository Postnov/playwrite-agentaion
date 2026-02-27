import { chromium } from 'playwright';

async function orderPepperoni() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'ru-RU',
  });
  const page = await context.newPage();

  try {
    // 1. Открываем Dodo Pizza Ташкент
    await page.goto('https://dodopizza.uz/tashkent', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // 2. Кликаем на раздел "Пицца"
    await page.waitForSelector('.sc-1uavg9b-1 > .sc-1uavg9b-2 > .sc-1uavg9b-4 > .sc-1c0ft0g-0', { timeout: 10000 });
    await page.click('.sc-1uavg9b-1 > .sc-1uavg9b-2 > .sc-1uavg9b-4 > .sc-1c0ft0g-0');
    await page.waitForTimeout(1500);

    // 3. Кликаем "Выбрать" у Пепперони
    await page.waitForSelector('#guyqe > .sc-1gfzx1o-4 > .sc-1gfzx1o-3 > .sc-18x94tv-0', { timeout: 10000 });
    await page.click('#guyqe > .sc-1gfzx1o-4 > .sc-1gfzx1o-3 > .sc-18x94tv-0');
    await page.waitForTimeout(2000);

    // 4. В модалке — кликаем "В корзину"
    await page.waitForSelector('[role="dialog"], [aria-modal="true"]', { timeout: 5000 }).catch(() => {});
    const addToCart = page.locator('button', { hasText: /в корзину/i });
    await addToCart.waitFor({ timeout: 5000 });
    await addToCart.click();
    await page.waitForTimeout(1500);

    console.log('Пепперони добавлена в корзину!');
  } catch (e) {
    console.error('Ошибка:', (e as Error).message);
  } finally {
    await browser.close();
  }
}

orderPepperoni();
