# Changelog

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
