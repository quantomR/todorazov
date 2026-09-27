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
		header: '/logo.png', // full lockup (login, etc.)
		mark: '/logo-mark.png', // compact hexagon-head mark for the header bar
		favicon: '/favicon.png',
		og: '/og.jpg',
	},

	// Hidden admin base path — pick an unguessable word per site.
	adminSlug: 'az-backstage-92',

	// localStorage keys: `${prefix}-cart`, `${prefix}-lang`
	storageKeyPrefix: 'todorazov',

	defaultLanguage: 'bg',
	languages: ['bg', 'en'],

	colorScheme: 'dark', // 'light' | 'dark'

	palette: {
		// Golden-yellow accent for the dramatic black-and-yellow theme.
		// The palette key is ALWAYS 'brand'.
		brand: [
			'#fff8e1', // 0 — lightest
			'#fdeec0',
			'#f7dd8f',
			'#f0cc5c',
			'#e8bd34',
			'#dcae1e', // 5 — primary golden
			'#c1971a',
			'#9a7714',
			'#74590f',
			'#4f3d09', // 9 — darkest
		],
		// Warm near-black scale (melancholic) for the dark site.
		// index 7 = page bg, 6 = cards, 4 = borders.
		dark: [
			'#d7d3c9', // 0 — light text
			'#b7b2a6',
			'#928d80',
			'#6d685d',
			'#4a463d', // 4 — borders
			'#312e28',
			'#222019', // 6 — cards
			'#161410', // 7 — page bg
			'#0e0d0a',
			'#070605', // 9
		],
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
		bg: '#141210',
		surface: '#1c1a15',
		surfaceAlt: '#24211a',
		border: '#39352c',
		text: '#ece7da',
		textDim: '#9a9384',
		accent: '#dcae1e',
		success: '#6fae5f',
		danger: '#d9634a',
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

	// Latest-video section (features.youtube). Admins pin a video in Settings;
	// that always wins. autoLatest additionally tries to resolve the channel's
	// newest upload via the youtube-latest Edge Function — but YouTube's RSS
	// feed 404s from cloud/edge IPs, so keep it OFF until it runs on the
	// YouTube Data API (with a key). channelId = the UC… id of the channel.
	youtube: {
		channelId: 'UCGBLquBIo-esRrCGuI8sqSQ',
		channelUrl: 'https://youtube.com/@todorazov',
		autoLatest: false,
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
