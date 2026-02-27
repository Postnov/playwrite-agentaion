# Maputo — Инструмент для разработки браузерных автоматизаций

Maputo объединяет [Playwright](https://playwright.dev/) и [Agentation](https://www.npmjs.com/package/agentation) для упрощения создания скриптов автоматизации. Вместо ручного поиска CSS-селекторов — открываете браузер, кликаете по нужным элементам, получаете аннотации с готовыми селекторами, отправляете их в AI-чат и получаете рабочий скрипт.

## Как это работает

```
1. record  →  Открывается браузер с Agentation UI
               Кликаете по элементам, добавляете комментарии
               Переходите между страницами — аннотации собираются со всех

2. Нажимаете кнопку копирования в панели Agentation
   → JSON всех аннотаций со всех страниц копируется в буфер
   → Вставляете в AI-чат (Claude, ChatGPT, etc.) → AI пишет Playwright-скрипт

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
# С указанием URL — сразу на нужную страницу
npx tsx src/index.ts record --url "https://dev-postnov.ru"

# Без URL — откроется welcome-страница с инструкциями
npx tsx src/index.ts record
```

Откроется Chromium. В правом нижнем углу появится тулбар Agentation:

- **Кликните по элементу** — он будет аннотирован (маркер с номером)
- **Добавьте комментарий** — опишите, что нужно сделать с этим элементом
- **Выделите текст** — для аннотации текстового контента
- **Переходите по ссылкам** — Agentation автоматически появится на новой странице, аннотации собираются со всех страниц

Когда закончили:

- **Кнопка копирования в Agentation** — копирует JSON всех аннотаций со всех страниц в буфер обмена
- Или **Q в терминале** — завершает запись, сохраняет JSON и Markdown в `recordings/`

### 2. Генерация скрипта через AI

Вставьте скопированный JSON в чат с AI:

```
Напиши Playwright-скрипт на TypeScript по этим аннотациям:

[
  {
    "element": "button [Поиск]",
    "elementPath": ".header > .header-container > .header-actions > #search-open",
    "comment": "Клик по поиску",
    "url": "https://dev-postnov.ru/"
  },
  {
    "element": "input \"Поиск по заметкам...\"",
    "elementPath": "#search-input",
    "comment": "Пишем тут «НДА»",
    "url": "https://dev-postnov.ru/"
  },
  ...
]
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
│   ├── types.ts              # Типы: Annotation, Recording
│   ├── browser/
│   │   └── browser-manager.ts  # Playwright lifecycle
│   ├── recorder/
│   │   ├── recorder.ts       # Оркестрация записи + markdown-вывод
│   │   ├── inject.ts         # Инъекция Agentation UI + авто-реинжект
│   │   └── welcome.html      # Страница инструкций (без --url)
│   ├── runner/
│   │   └── runner.ts         # Запуск скриптов
│   └── utils/
│       └── logger.ts         # Цветной лог
├── scripts/
│   ├── agentation-mount.tsx  # React-обёртка Agentation для бандла
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
3. **Bridge для данных**: `page.exposeFunction()` создаёт мост — аннотации из браузера приходят в Node.js через колбэки, а `getAllAnnotations` возвращает все собранные аннотации обратно в браузер
4. **Авто-реинжект**: при переходе между страницами Agentation автоматически появляется заново, а все собранные аннотации сохраняются на стороне Node.js
5. **Кнопка копирования**: встроена в тулбар Agentation — копирует JSON всех аннотаций со всех страниц

## Команды

```bash
npm run build:bundle      # Собрать Agentation-бандл
npm test                  # Запустить все тесты
npm run test:unit         # Только юнит-тесты
```

## Примеры

### Поиск статьи на dev-postnov.ru

```bash
# Запись
npx tsx src/index.ts record --url "https://dev-postnov.ru"

# В браузере: Поиск → «НДА» → клик на ссылку → копируем JSON
# Вставляем JSON в AI-чат → получаем скрипт

# Запуск
npx tsx src/index.ts run --script generated/dev-postnov-nda.ts
```

### Заказ пепперони на Dodo Pizza

```bash
# Запись
npx tsx src/index.ts record --url "https://dodopizza.uz/tashkent"

# В браузере: «Пицца» → «Выбрать» у Пепперони → копируем JSON

# Запуск
npx tsx src/index.ts run --script generated/dodo-pepperoni.ts
```

### Запуск без URL

```bash
# Откроется welcome-страница с инструкциями
npx tsx src/index.ts record

# Вводите URL в адресной строке → Agentation появится автоматически
```

## Технологии

- **[Playwright](https://playwright.dev/)** — управление браузером
- **[Agentation](https://www.npmjs.com/package/agentation)** — визуальное аннотирование элементов
- **React** — для рендера Agentation UI (только в инжектированном бандле)
- **esbuild** — сборка injectable-бандла
- **Zod** — валидация конфигурации
- **Vitest** — тесты
