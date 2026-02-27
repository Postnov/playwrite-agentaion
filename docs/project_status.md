# Maputo — Статус проекта

## Описание
Browser annotation recorder: Playwright + Agentation UI.
Фундамент для упрощения разработки автоматизаций.

## Текущая версия: v0.2.0

### Этап 1: MVP v1 (завершён, заменён v2)
- [x] Auto-mode agent (observe→think→act loop с DeepSeek) — **удалён**
- [x] Semi-auto mode — **удалён**
- Причина: ненадёжно на реальных сайтах, дорого по токенам

### Этап 2: v2 Record + Run (текущий)
- [x] Удалить v1 auto-mode код
- [x] Обновить зависимости (убрать openai, добавить react, esbuild)
- [x] Новые типы (Annotation, RecordedStep, Recording) и конфиг
- [x] esbuild bundle: React + ReactDOM + Agentation → IIFE
- [x] Recorder: инъекция Agentation UI + сбор аннотаций + сохранение JSON
- [x] Runner: запуск Playwright-скриптов
- [x] CLI: record + run подкоманды
- [x] Unit-тесты (11 тестов проходят)
- [x] Документация обновлена

### Этап 3: Улучшения (планируется)
- [ ] Integration-тест recorder на локальном HTML
- [ ] Скриншот на каждом шаге записи
- [ ] Авто-перезапуск инъекции при навигации (SPA)
- [ ] Шаблоны для популярных сайтов

## Где остановились
Этап 2 завершён. Все файлы созданы, тесты проходят.
Готово к тестированию: `npx tsx src/index.ts record --url "https://dodopizza.uz/tashkent"`

## Запуск
```bash
# Собрать бандл (первый раз)
npm run build:bundle

# Записать аннотации
npx tsx src/index.ts record --url "https://example.com"

# Запустить скрипт
npx tsx src/index.ts run --script generated/my-script.ts

# Тесты
npm test
```
