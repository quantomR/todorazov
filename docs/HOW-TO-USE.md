# Как се прави нов сайт от темплейта — стъпка по стъпка

Наръчник за ръчна употреба. Следвай точките по ред — нищо не се прескача. Реалистично време: **под 1 час** до работещ сайт.

---

## 0. Какво ти трябва предварително

- [ ] **GitHub** акаунт (repo-то и deploy-ят тръгват от него)
- [ ] **Supabase** акаунт — безплатният план позволява **2 активни проекта**; ако са заети, нов акаунт с друг имейл
- [ ] **Vercel** акаунт, вързан с GitHub акаунта
- [ ] **Node.js** 20+ инсталиран локално
- [ ] Логото и снимките на бранда (лого PNG, hero снимка, og изображение)

---

## 1. Създай repo от темплейта

1. Отвори https://github.com/quantomR/storefront-template
2. Зеленият бутон **Use this template** → **Create a new repository**
3. Име на repo-то = името на новия сайт → **Create repository**
4. Клонирай локално:

```bash
git clone https://github.com/<акаунт>/<новото-repo>.git
cd <новото-repo>
```

> ⚠️ **Важно за Vercel:** commit author-ът трябва да е GitHub акаунтът, вързан с Vercel, иначе deploy-ите излизат „Blocked":
> ```bash
> git config user.name "<github-username>"
> git config user.email "<id>+<username>@users.noreply.github.com"
> ```
> (ID-то се вижда на https://api.github.com/users/<username>)

---

## 2. Инсталация

```bash
npm install
```

`.npmrc` в repo-то вече решава peer конфликтите — не го трий.

---

## 3. Брандиране — `src/config/brand.js`

**Единственият код файл, който пипаш.** Отвори го и попълни:

| Поле | Какво е | Пример |
|---|---|---|
| `siteName` | Името на бранда (излиза в header, имейли, title) | `'MegaMerch'` |
| `tagline` | Слоган BG/EN (hero + footer) | |
| `description` | Meta описание BG/EN (Google/социални мрежи) | |
| `domain` | Вътрешен домейн за админ входа | `'megamerch.local'` |
| `siteUrl` | Production URL (за SEO); `null` за демо | `'https://megamerch.bg'` |
| `adminSlug` | **Скритият админ path — неотгатваема дума!** | `'zadnata-vrata'` |
| `storageKeyPrefix` | Уникален префикс за localStorage | `'megamerch'` |
| `defaultLanguage` | `'bg'` или `'en'` | |
| `colorScheme` | `'light'` или `'dark'` | |
| `palette.brand` | 10 нюанса на основния цвят (светъл → тъмен) | |
| `palette.dark` | Само при тъмен сайт: 10 тъмни нюанса (7 = фон на страницата, 6 = карти, 4 = бордове) | |
| `fonts` | body/heading + Google Fonts линк | |
| `semantic` | Токени: фон, повърхности, борд, текст, акцент | |
| `currency.secondaryBgn` | Да се показват ли и цени в лева | |
| `features.cart` | Количка + checkout + поръчки | `true` за магазин |
| `features.inquiry` | Форма за запитвания | |
| `features.attributes` | Спец. полета/характеристики на продуктите | `false` за прост merch |

Проверка: `npm run dev` → сайтът трябва да изглежда в новите цветове **без да пипаш нищо друго**.

---

## 4. Асети (фиксирани имена — просто презапиши файловете)

- [ ] `public/logo.png` — логото (header + login)
- [ ] `public/favicon.png` — иконка за таба (квадратна)
- [ ] `public/og.jpg` — изображение при споделяне (1200×630)
- [ ] `src/assets/hero.jpg` — голямата снимка на началната страница

> 💡 Ако снимката е малка/размазана — AI upscale с Real-ESRGAN преди да я сложиш.

---

## 5. Текстове

1. `src/i18n/bg.json` и `en.json` — пренапиши маркетинговите текстове (`about.text`, `home.*` и др.)
2. **`privacy.text` — задължително замени placeholder политиката** (checkout-ът изисква съгласие с нея)
3. Името на бранда НЕ се пише в json — ползвай `{{brand}}`
4. Провери паритета:

```bash
npm run check:i18n
```

---

## 6. Supabase

1. https://supabase.com → **New project** (запиши си database паролата)
2. Изчакай проектът да стане активен
3. **SQL Editor** → New query → копирай **целия** `supabase/schema.sql` → Run
   - Ако излезе notice за storage политики: Dashboard → **Storage** → `product-images` → **Policies** → добави ръчно: select (за всички), insert/update/delete (само authenticated)
4. Seed данните (3 демо продукта) са маркирани в schema.sql — изтрий ги през админа после
5. **Authentication** → Users → **Add user**:
   - Email: `admin@<domain от brand.js>` (напр. `admin@megamerch.local`)
   - Парола: избери
   - ✅ Auto Confirm User
   - Входът в сайта после е само с частта преди @ (напр. `admin`)

---

## 7. Env променливи

```bash
cp .env.example .env.local
```

Попълни от Supabase → Project Settings → API:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=<anon / publishable key>
```

---

## 8. Локална проверка

```bash
npm run dev
```

- [ ] Публичният сайт се отваря и е брандиран
- [ ] `/<adminSlug>` показва login → влез с админ акаунта
- [ ] Създай категория и продукт (сложи has_colors/has_sizes според нуждите), качи снимки
- [ ] Продуктът се вижда в магазина; тестова поръчка минава
- [ ] Всичко чисто:

```bash
npm run check && npm run build
```

---

## 9. Email известия (по избор — може и по-късно)

```bash
npx supabase functions deploy send-email --project-ref <ref>
npx supabase secrets set GMAIL_USER=you@gmail.com GMAIL_APP_PASSWORD=xxxx SITE_NAME="Име на сайта" --project-ref <ref>
```

- `GMAIL_APP_PASSWORD` = Google App Password (изисква включена 2FA на Gmail акаунта)
- После в админа → **Настройки** → попълни „Имейл за известия"

---

## 10. Vercel

1. https://vercel.com → **Add New → Project** → импортирай repo-то
2. Framework: **Vite** (разпознава се сам); build настройките са ок по подразбиране
3. **Environment Variables**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
4. **Deploy**

Пушни промените си преди това:

```bash
git add -A && git commit -m "brand setup" && git push
```

---

## 10а. Алтернативи на Vercel (по избор)

Сайтът е статичен build — всеки от тези хостинги работи еднакво добре. SPA redirect-ът е покрит: `vercel.json` (за Vercel) и `public/_redirects` (за Netlify/Cloudflare) са вече в темплейта.

### Netlify

1. https://app.netlify.com → **Add new site → Import an existing project** → избери repo-то
2. Build command: `npm run build` · Publish directory: `dist`
3. **Site configuration → Environment variables**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
4. **Deploy**

### Cloudflare Pages

1. https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → избери repo-то
2. Framework preset: **Vite** · Build command: `npm run build` · Build output: `dist`
3. **Environment variables**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
4. **Save and Deploy**

> ℹ️ **Astro не е хостинг** — това е framework (алтернатива на React+Vite, с който е строен темплейтът). Не бъркай двете: сайтовете от този темплейт се деплойват на Vercel/Netlify/Cloudflare, но не „на Astro".

---

## 11. Финален чеклист преди предаване

- [ ] Responsive: провери на телефон (375px), таблет (768px), десктоп (1280px)
- [ ] Админ слъгът НЕ е линкнат никъде в публичния сайт
- [ ] Demo продуктите са изтрити, има реални
- [ ] `privacy.text` е реална политика, не placeholder
- [ ] `siteUrl` е попълнен в brand.js (за SEO) и е направен нов deploy
- [ ] Сподели линк в чат (Viber/Messenger) — preview-то показва og.jpg и описанието
- [ ] `npm run check` чист

---

## Бързи команди (шпаргалка)

```bash
npm run dev          # локален сървър
npm run build        # production build (+ robots.txt/sitemap.xml)
npm run check        # lint + i18n паритет + theme дисциплина
npm run lint:fix     # авто-поправка на форматиране
```

## Ако нещо се счупи

| Симптом | Причина | Решение |
|---|---|---|
| Vercel deploy „Blocked" | Commit author ≠ Vercel акаунта | Стъпка 1, git config бележката |
| `npm install` фейлва с ERESOLVE | Изтрит `.npmrc` | Върни `.npmrc` с `legacy-peer-deps=true` |
| Празна бяла страница | Празен/грешен `.env.local` | Стъпка 7; виж Console-а на браузъра |
| Login не работи | Потребителят е с друг domain | Email-ът в Supabase = `<user>@<brand.domain>` |
| Снимки не се качват | Липсват storage политики | Стъпка 6.3 — добави ги през Dashboard |
| Чужд цвят някъде | Hex извън brand.js | `npm run check:theme` показва къде |
