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

### Этап 2.5: UX-улучшения (текущий)
- [x] Авто-реинжект Agentation при переходах между страницами
- [x] Сбор аннотаций со всех страниц (не только текущей)
- [x] Markdown-вывод со всех страниц, сгруппированный по URL
- [x] Упрощение: убран step-by-step ввод, просто Q для завершения
- [x] Кнопка "Copy JSON" в браузере — копирует все аннотации со всех страниц в буфер обмена
- [x] Welcome-страница: `record` без `--url` открывает инструкцию, пользователь сам переходит на нужный сайт

### Этап 3: Улучшения (планируется)
- [ ] Integration-тест recorder на локальном HTML
- [ ] Шаблоны для популярных сайтов

## Где остановились
Этап 2.5 завершён. Welcome-страница + Copy JSON + упрощённая запись.

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
