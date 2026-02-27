# Архитектура Maputo v2

## Стек
- **Runtime**: Node.js + TypeScript (tsx)
- **Browser**: Playwright (Chromium)
- **Annotation UI**: Agentation (React component, injected via esbuild IIFE bundle)
- **Build**: esbuild (для создания injectable бандла)
- **Config**: Zod + dotenv
- **Tests**: Vitest

## Архитектура

```
┌─────────────────────────────────────────────────┐
│  CLI (src/index.ts)                             │
│    record --url <url>  |  run --script <file>   │
├──────────────────────┬──────────────────────────┤
│  Recorder            │  Runner                  │
│  ├── inject.ts       │  └── runner.ts           │
│  └── recorder.ts     │      (npx tsx <script>)  │
├──────────────────────┴──────────────────────────┤
│  Browser Layer (Playwright)                     │
│  └── browser-manager.ts                         │
└─────────────────────────────────────────────────┘
```

## Workflow

```
1. npm run build:bundle → dist/agentation-bundle.js (300KB IIFE)
2. record --url "https://site.com"
   → Playwright открывает браузер
   → Инжектит Agentation UI через addScriptTag()
   → Пользователь аннотирует элементы
   → Аннотации приходят в Node.js через exposeFunction()
   → Сохраняются в recordings/*.json
3. Пользователь копирует JSON → вставляет в AI-чат → получает Playwright-скрипт
4. run --script generated/my-script.ts → выполнение
```

## Модули

### Browser (`src/browser/browser-manager.ts`)
Singleton: `launch(config)`, `getPage()`, `close()`. Управляет Chromium.

### Recorder (`src/recorder/`)
- **inject.ts** — инъекция Agentation bundle в страницу:
  - `page.exposeFunction()` — bridge для аннотаций (browser → Node.js)
  - `page.addScriptTag()` — загрузка IIFE-бандла
- **recorder.ts** — оркестрация записи:
  - readline-цикл в терминале (Enter = следующий шаг, q = завершить)
  - Сбор аннотаций через callback bridge
  - Сохранение Recording в JSON

### Runner (`src/runner/runner.ts`)
Запуск Playwright-скрипта через `execSync('npx tsx <path>')`.

### Build (`scripts/build-bundle.ts`)
esbuild собирает React + ReactDOM + Agentation + mount-код в один IIFE файл.
Mount-код создаёт `<div>`, рендерит `<Agentation>` с callback-пропсами.

## Структуры данных

```typescript
Annotation { id, x, y, comment, element, elementPath, timestamp, ... }
RecordedStep { stepNumber, url, action, annotations[] }
Recording { startUrl, steps[], createdAt }
```
