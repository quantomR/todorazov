# Нов сайт от този темплейт — runbook

Следвай стъпките по ред. Реалистично време: под 1 час до работещо демо.

## 1. Repo

- GitHub → **Use this template** → ново repo → clone локално
- `git config user.email` = имейлът на GitHub акаунта, вързан с Vercel (иначе deploy-ите излизат Blocked)

## 2. Инсталация

```bash
npm install
```

(`.npmrc` вече съдържа `legacy-peer-deps=true` — не го трий.)

## 3. Брандинг — `src/config/brand.js`

Единственият код файл, който пипаш:

- `siteName`, `tagline`, `description`, `domain`
- **`siteUrl`** — production URL-ът (за canonical, og:url и sitemap; null за демо)
- **`adminSlug`** — избери неотгатваема дума (скритият админ URL)
- `storageKeyPrefix` — уникален префикс за localStorage
- `colorScheme` (`light`/`dark`) + `palette.brand` (10 нюанса) + `palette.dark` (при тъмен сайт)
- `fonts` (+ `googleFontsHref`)
- `semantic` токени (фон, повърхности, бордове, текст)
- `currency.secondaryBgn` — дали изобщо да съществува BGN цена
- **`features`** — `cart`, `inquiry`, `attributes`, `filters` (facet филтри), `hours` (адрес+работно време), `sales` (отстъпки), `services` (ценоразпис), `legal` (`/terms`+`/refund`), `reviews` (ревюта+оценки), `video` (продуктово видео), `youtube` (най-ново видео на канала на началната страница — виж §8c), `payments` (карта чрез Stripe), `courier` (избор на офис — скелет), `analytics` (Plausible/GA+consent). Всички опционални флагове са `false` по подразбиране; колоните/таблиците им са в `schema.sql` независимо — включваш само UI-то с флага. Виж `docs/SETUP-QUESTIONNAIRE.md` за интейк въпросника.
- `brand.analytics` (provider `plausible`/`ga` + id), `brand.courier` (provider + офиси) — попълват се само ако включиш съответния флаг.

## 4. Асети (фиксирани имена — просто ги презапиши)

- `public/logo.png` — лого за header/login
- `public/favicon.png`
- `public/og.jpg` — social share изображение
- `src/assets/hero.jpg` — hero снимка на началната страница

## 5. Текстове

- `src/i18n/bg.json` + `en.json` — пренапиши маркетинговите текстове (`about.text`, tagline-ите). Името на бранда НЕ се пише в json — ползвай `{{brand}}`.
- **`privacy.text`** — задължително замени placeholder политиката за поверителност с реална (checkout-ът изисква съгласие с нея)
- Провери: `npm run check:i18n`

## 6. Supabase

1. Нов проект на supabase.com
2. SQL Editor → пусни целия `supabase/schema.sql`
   - При notice за storage политики: Dashboard → Storage → `product-images` → Policies: select (всички), insert/update/delete (authenticated)
3. Изтрий/редактирай demo продуктите (seed-а е маркиран в schema.sql)
4. Authentication → Add user → `admin@<brand.domain>` + парола (Auto Confirm ✓). Входът в админа е само с частта преди @.

## 7. Env

```bash
cp .env.example .env.local
# попълни VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (Project Settings → API)
```

## 8. Email нотификации (по избор)

```bash
npx supabase functions deploy send-email --project-ref <ref>
npx supabase secrets set GMAIL_USER=... GMAIL_APP_PASSWORD=... SITE_NAME="Име на сайта" --project-ref <ref>
```

После в админа → Настройки → попълни „Имейл за известия".

## 8b. Плащане с карта — Stripe (по избор, `features.payments`)

```bash
npx supabase functions deploy create-checkout --project-ref <ref>
npx supabase functions deploy order-status   --project-ref <ref>
npx supabase functions deploy stripe-webhook  --no-verify-jwt --project-ref <ref>
npx supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_... SITE_URL=https://<домейн> --project-ref <ref>
```

После в Stripe Dashboard → Webhooks добави endpoint към URL-а на `stripe-webhook` за събитието `checkout.session.completed` (secret-ът = `STRIPE_WEBHOOK_SECRET`). Тествай с тестови ключове преди live. Наложеният платеж работи и без Stripe — картовото плащане е допълнителна опция в checkout-а.

## 8c. Най-ново YouTube видео на началната (по избор, `features.youtube`)

1. Вземи `channelId` (UC…): отвори канала → View Source → търси `"channelId"` (или `externalId`). Попълни `brand.youtube.channelId` + `channelUrl` и вдигни `features.youtube: true`.
2. Деплойни функцията, която чете публичния RSS фийд server-side (браузърът не може — CORS):

```bash
npx supabase functions deploy youtube-latest --no-verify-jwt --project-ref <ref>
```

Функцията не ползва секрети/база — само публичния фийд. Началната показва YouTube-ския player с най-новото видео. В админа → Настройки можеш да „закачиш" конкретно видео (bие автоматичното).

## 9. Локален smoke

```bash
npm run dev
```

- Публичен сайт + `/<adminSlug>` login
- Създай продукт (с цветове/размери според нуждите), качи снимки
- Тестова поръчка/запитване
- `npm run check && npm run build` — трябва да са чисти

## 10. Vercel

- Import на repo-то, env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Deploy (SPA rewrite е в `vercel.json`)

## 11. Финален чеклист

- [ ] Responsive: 375 / 768 / 1280 на всички страници
- [ ] Админ слъгът не е линкнат никъде в публичния сайт
- [ ] Seed данните са изтрити/заменени
- [ ] `npm run check` чист
- [ ] OG preview изглежда добре (сподели URL-а в чат за проверка)
