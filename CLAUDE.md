# CLAUDE.md — Storefront Template Rules

## 1. Форматиране и линт

- **ESLint + Prettier** задължителни — не се commit-ва код с lint грешки
- **Indentation:** Tabs; **Semicolons:** да; **Quotes:** single за JS, double за JSX атрибути
- `npm run check` (lint + check:i18n + check:theme) трябва да е чист преди всеки commit

## 2. Брандинг — КРИТИЧНО ПРАВИЛО

- **Целият брандинг живее в `src/config/brand.js`** (+ `src/theme/`)
- Компонентите ползват САМО: Mantine semantic props (`c="dimmed"`, `color="brand"`), `var(--sf-*)` CSS променливи, `var(--mantine-color-brand-N)`
- **Никакви hex/rgb литерали и fontFamily извън `src/config/` и `src/theme/`** — `npm run check:theme` го налага
- Името на бранда не се пише никъде: `brand.siteName` в код, `{{brand}}` в i18n стрингове
- Модулите се гейтват от `brand.features` само на 3 места: router, Header, AdminLayout

## 3. Supabase заявки — КРИТИЧНО ПРАВИЛО

- **Всеки запис (Save) = една заявка** — без per-поле/per-ред заявки
- Reorder (drag & drop) = един batch `upsert` с ПЪЛНИ редове (частични редове чупят insert клона)
- Запис на продукт = едно извикване на RPC `save_product` (продукт + цветове + размери + полета в една транзакция)
- Цветовете в RPC-то се upsert-ват по id (клиентски `crypto.randomUUID()` за нови) — пълен delete+reinsert би каскаднал снимките им. НЕ опростявай.
- Публичните форми (orders/inquiries) insert-ват **без** `.select()` (anon RLS няма select)
- Settings = един `upsert` масив

## 4. Пари

- Базата пази САМО EUR. BGN е производна стойност — `src/lib/currency.js` е единственото място с курса
- Цена на ред в количката се резолвва при добавяне: `color.price_override_eur ?? product.price_eur`

## 5. i18n

- Всеки нов текст едновременно в `bg.json` и `en.json` (`npm run check:i18n`)
- Ключове на английски в dot notation; никакви хардкоднати потребителски текстове в JSX
- Съдържание от базата: `_bg`/`_en` колони, fallback празно EN → BG през `lib/localized.js`

## 6. Известни капани (не ги преоткривай)

- Mantine 9 `Collapse` е с prop **`expanded=`** (не `in=`) — грешният тихо не се отваря
- `react-hooks/set-state-in-effect`: в effects ползвай promise chain (`.then(setX)`), не sync setState
- Chunk-reload listener-ът в `main.jsx` стои НАД останалите imports
- dnd-kit: PointerSensor `activationConstraint: {distance: 8}` + TouchSensor, иначе бутоните в draggable редове не се кликат на телефон
- Снимки на нов продукт — чак след първия save (трябва id); UI-ят показва подсказка
- `.npmrc` с legacy-peer-deps е задължителен (React 19 peer конфликти)
- Vercel: commit author-ът трябва да е акаунтът, вързан с Vercel (иначе „Blocked" deploy)
- storage политиките в schema.sql са в exception wrapper — при notice се добавят през Dashboard

## 7. Компоненти

- Един компонент = един файл; ~150 реда таван (разбивай при нужда)
- Props се деструктурират в сигнатурата; без нетривиални inline функции в JSX
- Mobile-first; проверка на 375/768/1280 след всяка задача

## 8. Работен процес

- Не се добавят нови библиотеки/архитектури без одобрение
- След всеки task: правилно място на кода, lint, спека, responsive, тези конвенции
- В края на фаза: пълно review като senior developer
