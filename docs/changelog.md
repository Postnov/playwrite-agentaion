# Changelog

## 2026-02-27 — v0.2.1 — UX: кнопка Copy JSON + welcome-страница + упрощение записи

### Добавлено
- **Welcome-страница** — `record` без `--url` открывает страницу с инструкциями, пользователь сам переходит на нужный сайт
- **Кнопка "Copy JSON" в браузере** — копирует все аннотации со всех посещённых страниц в буфер обмена
- Bridge-функция `__maputo_getAllAnnotations` — Playwright bridge для передачи аннотаций из Node.js обратно в браузер
- Авто-реинжект Agentation при навигации между страницами
- Поле `url` в типе Annotation — отслеживание, на какой странице сделана аннотация
- Markdown-вывод группирует аннотации по URL страниц

### Изменено
- `--url` теперь необязательный параметр для `record`
- Упрощён процесс записи: убран step-by-step ввод (Enter→описание→Enter), теперь просто Q для завершения
- Тип Recording упрощён: `annotations: Annotation[]` вместо `steps: RecordedStep[]`

### Удалено
- Тип `RecordedStep` — не нужен при плоском сборе аннотаций

## 2026-02-27 — v0.2.0 — Переход на Record + Run

### Изменено
- **Полная переработка архитектуры**: с AI-driven agent loop на ручную запись аннотаций
- Убрана зависимость `openai` — нет AI API в проекте
- Упрощён конфиг: только browser settings

### Удалено
- Agent layer (action-loop, semi-auto) — автоматический режим
- AI layer (deepseek-client, prompts, action-parser) — не используется
- DOM layer (injected-scripts, dom-analyzer) — заменён полной интеграцией Agentation

### Добавлено
- **esbuild bundle**: React + ReactDOM + Agentation собирается в единый IIFE (~300KB) для инъекции в любую страницу
- **Recorder**: открывает браузер с Agentation UI, пользователь размечает элементы, аннотации сохраняются в JSON
- **Runner**: запуск готовых Playwright-скриптов через tsx
- **CLI**: две подкоманды — `record --url` и `run --script`
- Новые типы: Annotation, RecordedStep, Recording
- 11 unit-тестов

## 2026-02-27 — v0.1.0 — Initial implementation

### Добавлено
- Browser layer: Playwright lifecycle + actions
- DOM layer: извлечённые Agentation-функции для page.evaluate()
- AI layer: DeepSeek API с function calling
- Agent layer: observe→think→act в двух режимах (auto / semi-auto)
- CLI + пример задачи (Dodo Pizza)
- 30 unit-тестов
