# Storefront Template

Многократно използваем e-commerce темплейт (React 19 + Vite + Mantine 9 + Supabase + Vercel), извлечен от два production сайта. Нов брандиран сайт = клониране + един конфиг файл + асети + schema.sql.

📖 **Наръчник стъпка по стъпка**: [docs/HOW-TO-USE.md](docs/HOW-TO-USE.md) (или отвори [docs/how-to-use.html](docs/how-to-use.html) в браузър за четимата версия с чеклистове). Краткият технически runbook е в **TEMPLATE.md**.

## Какво включва

- **Каталог**: категории, продукти с per-продукт checkbox-и „има цветове" / „има размери" — цветови варианти със собствени снимки и опционална цена, размери като подредени етикети. Покрива магазин за свещи (само цветове), merch (цвят × размер) и прости продукти.
- **Количка + Checkout** (флаг `features.cart`): наложен платеж, адрес за доставка, поръчки с 5 статуса в админа
- **Запитвания** (флаг `features.inquiry`): свободна форма + админ обработка
- **Спец. полета** (флаг `features.attributes`): глобален шаблон от характеристики с drag & drop подредба + custom полета per продукт
- **Филтри / facets** (флаг `features.filters`): параметри per категория (чекбокси с дискретни стойности **или** числов обхват), sidebar с multi-select филтри в магазина (OR в параметъра, AND между параметрите) + сортиране; admin управление на филтрите
- **Ревюта + оценки** (флаг `features.reviews`): публични ревюта с модерация, средна оценка на продукта, сортиране по оценка
- **Продуктово видео** (флаг `features.video`): YouTube/Vimeo/mp4 embed в продуктовата галерия
- **Плащане с карта** (флаг `features.payments`): Stripe Hosted Checkout + webhook (Supabase Edge Functions); наложеният платеж работи и без него
- **Куриер office-picker** (флаг `features.courier`, скелет): избор адрес/офис на checkout, provider-agnostic (Еконт reference адаптер). Планирано: захранване от `@quantomr/bg-couriers` (виж „В разработка")
- **Анализ + consent** (флаг `features.analytics`): Plausible/GA инжектиране зад cookie съгласие
- **Работно време + локация** (флаг `features.hours`): адрес с Google/Waze линкове и седмично работно време на контактната страница, редактируеми в админа; LocalBusiness JSON-LD
- **Отстъпки** (флаг `features.sales`): per-продукт процентна или фиксирана отстъпка — badge и зачертана цена на картата и продуктовата страница
- **Ценоразпис** (флаг `features.services`): самостоятелна категоризирана страница с услуги/цени (или „по запитване") + админ CRUD
- **Правни страници** (флаг `features.legal`): data-driven `/terms` и `/refund` от i18n секции (черновови GDPR текстове за преглед)
- **Per-продукт SEO** (винаги): meta title/description override полета с преглед в резултатите от търсене
- **Card image фокус** (винаги): drag фокусна точка + contain/cover за неравномерни продуктови снимки
- **Скрит админ** на конфигурируем slug, inline login (username-базиран)
- **BG/EN** локализация с `{{brand}}` интерполация; съдържанието в базата е `_bg`/`_en`
- **EUR цени** + опционално BGN показване (фиксиран курс, изчисляван в клиента)

## В разработка

- **`@quantomr/bg-couriers`** (`E:\custom-libraries\bg-couriers`, план в `PLAN.md` там) —
  самостоятелна TypeScript библиотека за българските куриерски API-та зад общ
  `CourierAdapter` интерфейс с каноничен статус речник и capabilities матрица.
  v1.0: Econt + Speedy (товарителници, етикети, tracking, returns, COD справки);
  v1.1: Box Now (автомати); v1.2: Pigeon Express. Private, docs-first срещу официалните
  demo среди; open source (MIT) при v1. В темплейта ще замени reference адаптера на
  office-picker-а и ще добави авто-товарителници + tracking в админа (нов флаг при
  интеграцията). Не се интегрира никъде, докато не излезе v1.0.

## Архитектурни правила

- **Целият брандинг е в `src/config/brand.js`** — цветове, фонтове, лого, feature флагове. Нула hex стойности в компоненти (проверява се с `npm run check:theme`)
- **Един запис = една заявка**: DnD пренареждания са batch upsert; целият запис на продукт (продукт + цветове + размери + полета) е една `save_product` RPC транзакция
- RLS: публично четене на каталога, писане само за админ; поръчки/запитвания са anon insert-only
- i18n паритет между bg/en се проверява с `npm run check:i18n`

## Сигурност и SEO

- **Сигурност**: RLS на всички таблици (публично четене, admin писане, поръчки/запитвания anon insert-only), RPC revoke от anon, тайните само в Supabase secrets, email функцията резолвва получателя server-side и escape-ва HTML. `npm run check:env` блокира commit на изтекли Supabase/Stripe/Resend секрети. Скритият админ slug е обфускация — истинската защита е auth-ът.
- **SEO**: динамични title/description per страница (`usePageMeta`) с пълен Open Graph + Twitter card + og:locale/type; масив JSON-LD (Product на продуктите, Organization + WebSite на home, LocalBusiness при включени hours); per-продукт meta override; canonical + og:url (при зададен `siteUrl`); `robots.txt` + `sitemap.xml` генерирани при build; noindex на количка/checkout/админ; `<`-escape на JSON-LD.
- **GDPR**: `/privacy` страница (замени placeholder текста!) + задължителен consent checkbox на checkout.
- **Не е включено** (добавя се при нужда per сайт): captcha/rate limit на формите (Cloudflare Turnstile), 2FA за админа (Supabase MFA), автоматични backup-и.

## Скриптове

```bash
npm run dev          # dev сървър
npm run build        # production build
npm run check        # lint + i18n паритет + theme дисциплина + env секрети
npm run lint:fix     # авто-поправка на форматиране
```

## Структура

```
src/config/brand.js   ← брандинг (единственият файл за нов сайт)
src/theme/            ← Mantine тема + CSS vars от конфига
src/lib/              ← supabase, currency, localized, cart, email
src/services/         ← една услуга на домейн (public/admin разделени)
src/components/       ← ui / shop / admin
src/pages/            ← client / admin
supabase/schema.sql   ← пълна схема + RLS + RPC + seed
scripts/              ← check-i18n, check-theme
```
