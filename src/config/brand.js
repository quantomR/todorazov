/**
 * THE single source of branding for this site.
 *
 * When cloning the template for a new brand, this is the ONLY code file
 * you have to edit: name, colors, fonts, admin path and feature toggles.
 * Also replace the assets in /public and src/assets (fixed file names).
 *
 * This module must stay dependency-free — it is imported both by app
 * code and by vite.config.js (brand-html plugin).
 */
export const brand = {
	siteName: 'Todor Azov',
	tagline: {
		bg: 'Официалният мърч',
		en: 'Official merch',
	},
	description: {
		bg: 'Официалният онлайн магазин за мърч на Todor Azov — суичъри, тениски, книги и още.',
		en: 'The official Todor Azov merch store — hoodies, t-shirts, books and more.',
	},

	// Auth usernames are expanded to <username>@<domain>.
	domain: 'todorazov.com',

	// Public production URL (no trailing slash), e.g. 'https://myshop.com'.
	// Used for canonical links, og:url and the generated sitemap.
	// null = skipped (fine for previews/demos).
	siteUrl: null,

	logo: {
		header: '/logo.png',
		favicon: '/favicon.png',
		og: '/og.jpg',
	},

	// Hidden admin base path — pick an unguessable word per site.
	adminSlug: 'az-backstage-92',

	// localStorage keys: `${prefix}-cart`, `${prefix}-lang`
	storageKeyPrefix: 'todorazov',

	defaultLanguage: 'bg',
	languages: ['bg', 'en'],

	colorScheme: 'light', // 'light' | 'dark'

	palette: {
		// Mantine 10-shade scale; the palette key is ALWAYS 'brand'.
		brand: [
			'#f4f6f8', // 0 — lightest
			'#e6eaee',
			'#c9d2da',
			'#a9b8c5',
			'#8da1b2',
			'#7b93a7', // 5 — primary
			'#6f89a0',
			'#5d768c',
			'#51697e',
			'#425a6e', // 9 — darkest
		],
		// Optional Mantine `dark` scale override for dark sites
		// (index 7 = page bg, 6 = cards, 4 = borders).
		dark: null,
	},
	primaryShade: 5,

	fonts: {
		body: "'Inter', system-ui, sans-serif",
		heading: "'Inter', system-ui, sans-serif",
		// Injected into index.html when set, e.g.
		// 'https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap'
		googleFontsHref: 'https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap',
	},
	defaultRadius: 'md',

	// Semantic tokens → CSS variables --sf-* (see src/theme/index.js).
	// Components may ONLY use these vars or Mantine tokens — never raw hex.
	semantic: {
		bg: '#f7f8f9',
		surface: '#ffffff',
		surfaceAlt: '#eef1f4',
		border: '#dde3e8',
		text: '#20262c',
		textDim: '#68737d',
		accent: '#7b93a7',
		success: '#4c8a55',
		danger: '#b04a3a',
	},

	currency: {
		primary: 'EUR',
		// Build-time capability; the runtime on/off switch is the
		// `show_bgn_price` row in the settings table (admin-controlled).
		secondaryBgn: true,
	},

	features: {
		cart: true, // cart + checkout + admin orders
		inquiry: true, // custom-request form + admin inquiries
		attributes: false, // merch needs no spec tables
		hours: false, // online only for now — no physical address yet
		sales: true, // per-product discounts (badge + struck-through price)
		services: false, // no standalone price-list
		legal: true, // /terms and /refund pages (privacy is always on)
		filters: false, // start simple — category + sort is enough
		reviews: false, // enable later if wanted
		video: true, // optional product video (YouTube/Vimeo/mp4)
		payments: false, // COD only for launch — Stripe stays behind the flag
		courier: false, // courier office picker at checkout (needs a provider adapter)
		analytics: false, // Plausible/GA injection + cookie consent (set brand.analytics)
		youtube: true, // latest-video section on the homepage (see brand.youtube)
	},

	// Latest-video section (features.youtube). channelId is the UC… id of the
	// YouTube channel; the youtube-latest Edge Function resolves the newest
	// upload from its public RSS feed. Admins can pin a specific video in
	// Settings. Find the id at youtube.com/<channel> → page source "channelId".
	youtube: {
		channelId: 'UCGBLquBIo-esRrCGuI8sqSQ',
		channelUrl: 'https://youtube.com/@todorazov',
	},

	// Web analytics (features.analytics). provider: 'plausible' | 'ga' | null.
	// plausible: id = your domain. ga: id = the G-XXXX measurement id.
	analytics: {
		provider: null,
		id: null,
	},

	// Courier office pickup (features.courier). SCAFFOLD — provider-agnostic.
	// provider: 'manual' uses the `offices` list below (works out of the box);
	// 'econt' fetches Econt's public office nomenclature (reference adapter,
	// verify before production). See src/lib/courier.js.
	courier: {
		provider: 'manual',
		offices: [
			{ id: 'sof-1', name: 'Офис Център', city: 'София' },
			{ id: 'plv-1', name: 'Офис Кючук Париж', city: 'Пловдив' },
		],
	},

	shop: {
		pageSize: 12,
	},

	contact: {
		instagram: null,
		facebook: null,
	},
};
