# Maputo — Инструмент для разработки браузерных автоматизаций

Maputo объединяет [Playwright](https://playwright.dev/) и [Agentation](https://www.npmjs.com/package/agentation) для упрощения создания скриптов автоматизации. Вместо ручного поиска CSS-селекторов — открываете браузер, кликаете по нужным элементам, получаете аннотации с готовыми селекторами, отправляете их в AI-чат и получаете рабочий скрипт.

## Как это работает

```
1. record  →  Открывается браузер с Agentation UI
               Вы кликаете по элементам, добавляете комментарии
               Аннотации сохраняются в JSON

2. Копируете аннотации → вставляете в чат с AI (Claude, ChatGPT, etc.)
   AI пишет Playwright-скрипт

3. run     →  Запускаете сгенерированный скрипт
```

## Установка

```bash
git clone <repo-url>
cd maputo
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

- **Кликните по элементу** на странице — он будет аннотирован (появится маркер с номером)
- **Добавьте комментарий** — опишите, что нужно сделать с этим элементом
- **Выделите текст** — для аннотации текстового контента
- **Перетащите область** — для выделения нескольких элементов

В терминале:
- **Enter** — сохранить текущий шаг, перейти к следующему
- **q** — завершить запись и сохранить в `recordings/recording-<timestamp>.json`

### 2. Генерация скрипта через AI

Откройте сохранённый JSON (или скопируйте markdown из Agentation UI) и вставьте в чат с AI. Пример промпта:

```
Напиши Playwright-скрипт на TypeScript по этим аннотациям:

## Page Feedback: /tashkent
### 1. link "Пицца"
**Location:** .sc-1uavg9b-1 > .sc-1uavg9b-2 > .sc-1uavg9b-4 > .sc-1c0ft0g-0
**Feedback:** Кликаем на раздел пицца

### 2. button "Выбрать"
**Location:** #guyqe > .sc-1gfzx1o-4 > .sc-1gfzx1o-3 > .sc-18x94tv-0
**Feedback:** Кликаем "Выбрать" у Пепперони
```

AI сгенерирует готовый скрипт. Сохраните его в `generated/`.

### 3. Запуск скрипта

```bash
npx tsx src/index.ts run --script generated/dodo-pepperoni.ts
```

Или напрямую:

```bash
npx tsx generated/dodo-pepperoni.ts
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
│   │   ├── recorder.ts       # Оркестрация записи
│   │   └── inject.ts         # Инъекция Agentation UI в страницу
│   ├── runner/
│   │   └── runner.ts         # Запуск скриптов
│   └── utils/
│       └── logger.ts         # Цветной лог
├── scripts/
│   └── build-bundle.ts       # Сборка Agentation IIFE-бандла
├── dist/
│   └── agentation-bundle.js  # Собранный бандл (~300KB)
├── recordings/               # Сохранённые аннотации (JSON)
├── generated/                # Playwright-скрипты
└── tests/
```

## Как работает инъекция Agentation

Agentation — это React-компонент. Чтобы он работал на любом сайте (который не использует React), мы:

1. **Собираем бандл** (`npm run build:bundle`): esbuild пакует React + ReactDOM + Agentation в один IIFE-файл (~300KB)
2. **Инжектим в страницу**: Playwright вызывает `page.addScriptTag({ content: bundleCode })`
3. **Bridge для данных**: `page.exposeFunction()` создаёт мост — аннотации из браузера приходят в Node.js через колбэки

## Команды

```bash
npm run build:bundle      # Собрать Agentation-бандл
npm run record            # Запустить запись (нужен --url)
npm run run:script        # Запустить скрипт (нужен --script)
npm test                  # Запустить все тесты
npm run test:unit         # Только юнит-тесты
```

## Пример: заказ пепперони на Dodo Pizza

1. Запись:
```bash
npx tsx src/index.ts record --url "https://dodopizza.uz/tashkent"
```

2. Аннотируем в браузере:
   - Кликаем на ссылку "Пицца" → комментарий: "Перейти в раздел пицц"
   - Enter в терминале
   - Кликаем "Выбрать" у Пепперони → комментарий: "Выбрать Пепперони"
   - q в терминале

3. Копируем аннотации из JSON → вставляем в AI-чат → получаем скрипт

4. Запуск:
```bash
npx tsx src/index.ts run --script generated/dodo-pepperoni.ts
```

## Технологии

- **Playwright** — управление браузером
- **Agentation** — визуальное аннотирование элементов
- **React** — для рендера Agentation UI (только в инжектированном бандле)
- **esbuild** — сборка injectable-бандла
- **Zod** — валидация конфигурации
- **Vitest** — тесты
