# Maputo — Инструмент для разработки браузерных автоматизаций

Maputo объединяет [Playwright](https://playwright.dev/) и [Agentation](https://www.npmjs.com/package/agentation) для упрощения создания скриптов автоматизации. Вместо ручного поиска CSS-селекторов — открываете браузер, кликаете по нужным элементам, получаете аннотации с готовыми селекторами, отправляете их в AI-чат и получаете рабочий скрипт.

## Как это работает

```
1. record  →  Открывается браузер с Agentation UI
               Вы кликаете по элементам, добавляете комментарии
               Переходите между страницами — аннотации собираются со всех

2. По завершении записи — в терминале появляется готовый markdown
   со всеми шагами со всех страниц. Копируете → вставляете в AI-чат
   (Claude, ChatGPT, etc.) → AI пишет Playwright-скрипт

3. run     →  Запускаете сгенерированный скрипт
```

## Установка

```bash
git clone https://github.com/Postnov/playwrite-agentaion.git
cd playwrite-agentaion/maputo
npm install

# Установить Chromium (если ещё нет)
npx playwright install chromium

# Собрать Agentation-бандл (один раз)
npm run build:bundle
```

## Использование

### 1. Запись аннотаций

```bash
npx tsx src/index.ts record --url "https://dodopizza.uz/tashkent"
```

Откроется Chromium. В правом нижнем углу появится тулбар Agentation:

- **Кликните по элементу** — он будет аннотирован (маркер с номером)
- **Добавьте комментарий** — опишите, что нужно сделать с этим элементом
- **Выделите текст** — для аннотации текстового контента
- **Перетащите область** — для выделения нескольких элементов
- **Переходите по ссылкам** — Agentation автоматически появится на новой странице

В терминале:
- **Enter** — сохранить текущий шаг (опишите действие), перейти к следующему
- **q** — завершить запись

По завершении записи:
- Сохраняется JSON: `recordings/recording-<timestamp>.json`
- Сохраняется Markdown: `recordings/recording-<timestamp>.md`
- В терминале выводится полный markdown со всех страниц — готовый для копирования

### 2. Генерация скрипта через AI

Скопируйте markdown из терминала (или из `.md` файла) и вставьте в чат с AI. Пример:

```
Напиши Playwright-скрипт на TypeScript по этим аннотациям:

## Recording: https://dev-postnov.ru

### Step 1. Ищем статью про НДА
**Page:** https://dev-postnov.ru

- **button [Поиск]** — "Клик на поиск"
  **Selector:** `.header > .header-container > .header-actions > #search-open`

- **input "Поиск по заметкам..."** — "Вводим «НДА» и ждем списка ссылок"
  **Selector:** `#search-modal > .search-modal-content > .search-modal-header > #search-input`

- **link "Решаем проблему НДА"** — "Кликаем на ссылку"
  **Selector:** `.search-modal-content > #search-results > .search-result-item > .search-result-title`
```

AI сгенерирует готовый скрипт. Сохраните его в `generated/`.

### 3. Запуск скрипта

```bash
npx tsx src/index.ts run --script generated/dev-postnov-nda.ts
```

Или напрямую:

```bash
npx tsx generated/dev-postnov-nda.ts
```

## Структура проекта

```
maputo/
├── src/
│   ├── index.ts              # CLI: record | run
│   ├── config.ts             # Настройки браузера (Zod)
│   ├── types.ts              # Типы: Annotation, RecordedStep, Recording
│   ├── browser/
│   │   └── browser-manager.ts  # Playwright lifecycle
│   ├── recorder/
│   │   ├── recorder.ts       # Оркестрация записи + markdown-вывод
│   │   └── inject.ts         # Инъекция Agentation UI + авто-реинжект
│   ├── runner/
│   │   └── runner.ts         # Запуск скриптов
│   └── utils/
│       └── logger.ts         # Цветной лог
├── scripts/
│   └── build-bundle.ts       # Сборка Agentation IIFE-бандла
├── dist/
│   └── agentation-bundle.js  # Собранный бандл (~300KB)
├── recordings/               # Аннотации: JSON + Markdown
├── generated/                # Playwright-скрипты
└── tests/
```

## Как работает инъекция Agentation

Agentation — это React-компонент. Чтобы он работал на любом сайте (который не использует React), мы:

1. **Собираем бандл** (`npm run build:bundle`): esbuild пакует React + ReactDOM + Agentation в один IIFE-файл (~300KB)
2. **Инжектим в страницу**: Playwright вызывает `page.addScriptTag({ content: bundleCode })`
3. **Bridge для данных**: `page.exposeFunction()` создаёт мост — аннотации из браузера приходят в Node.js через колбэки
4. **Авто-реинжект**: при переходе между страницами Agentation автоматически появляется заново, а все собранные аннотации сохраняются на стороне Node.js

## Команды

```bash
npm run build:bundle      # Собрать Agentation-бандл
npm run record            # Запустить запись (нужен --url)
npm run run:script        # Запустить скрипт (нужен --script)
npm test                  # Запустить все тесты
npm run test:unit         # Только юнит-тесты
```

## Примеры

### Поиск статьи и клик на dev-postnov.ru

```bash
# Запись
npx tsx src/index.ts record --url "https://dev-postnov.ru"

# В браузере: кликаем Поиск → вводим «НДА» → кликаем на ссылку → кликаем «Уважаемо»
# В терминале: Enter (описываем шаг) → q (завершаем)

# Запуск готового скрипта
npx tsx src/index.ts run --script generated/dev-postnov-nda.ts
```

### Заказ пепперони на Dodo Pizza

```bash
# Запись
npx tsx src/index.ts record --url "https://dodopizza.uz/tashkent"

# В браузере: кликаем «Пицца» → кликаем «Выбрать» у Пепперони
# В терминале: Enter (описываем шаг) → q (завершаем)

# Запуск готового скрипта
npx tsx src/index.ts run --script generated/dodo-pepperoni.ts
```

## Технологии

- **[Playwright](https://playwright.dev/)** — управление браузером
- **[Agentation](https://www.npmjs.com/package/agentation)** — визуальное аннотирование элементов
- **React** — для рендера Agentation UI (только в инжектированном бандле)
- **esbuild** — сборка injectable-бандла
- **Zod** — валидация конфигурации
- **Vitest** — тесты
