import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';

// og:locale codes per language. Falls back to the bare language code.
const OG_LOCALE = {
	bg: 'bg_BG',
	en: 'en_US',
};

const setMetaTag = (attr, name, content) => {
	let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
	if (!content) {
		tag?.remove();
		return;
	}
	if (!tag) {
		tag = document.createElement('meta');
		tag.setAttribute(attr, name);
		document.head.appendChild(tag);
	}
	tag.setAttribute('content', content);
};

const setCanonical = (href) => {
	let tag = document.head.querySelector('link[rel="canonical"]');
	if (!href) {
		tag?.remove();
		return;
	}
	if (!tag) {
		tag = document.createElement('link');
		tag.setAttribute('rel', 'canonical');
		document.head.appendChild(tag);
	}
	tag.setAttribute('href', href);
};

// Accepts a single schema object or an array of them. The `<` escape is
// defence-in-depth against a `</script>` breakout from DB-sourced strings.
const setJsonLd = (data) => {
	let tag = document.getElementById('page-jsonld');
	const list = Array.isArray(data) ? data.filter(Boolean) : data ? [data] : [];
	if (list.length === 0) {
		tag?.remove();
		return;
	}
	if (!tag) {
		tag = document.createElement('script');
		tag.type = 'application/ld+json';
		tag.id = 'page-jsonld';
		document.head.appendChild(tag);
	}
	const payload = list.length === 1 ? list[0] : list;
	tag.textContent = JSON.stringify(payload).replace(/</g, '\\u003c');
};

/**
 * Per-page SEO meta: title, description, canonical, robots noindex,
 * Open Graph + Twitter card tags and optional JSON-LD structured data.
 *
 * `jsonLd` may be a single schema object or an array of them (e.g.
 * Organization + WebSite on the home page). Call once per page component;
 * all values reset on navigation.
 */
export function usePageMeta({
	title,
	description,
	image,
	jsonLd,
	noindex,
	ogType = 'website',
} = {}) {
	const location = useLocation();
	const { i18n } = useTranslation();
	const lang = i18n.language;

	useEffect(() => {
		const fullTitle = title ? `${title} — ${brand.siteName}` : brand.siteName;
		const desc = description ?? brand.description[lang] ?? brand.description[brand.defaultLanguage];
		const url = brand.siteUrl ? `${brand.siteUrl}${location.pathname}` : null;
		const img = image ?? brand.logo.og;

		document.title = fullTitle;
		setMetaTag('name', 'description', desc);

		// Open Graph
		setMetaTag('property', 'og:site_name', brand.siteName);
		setMetaTag('property', 'og:type', ogType);
		setMetaTag('property', 'og:locale', OG_LOCALE[lang] ?? lang);
		setMetaTag('property', 'og:title', fullTitle);
		setMetaTag('property', 'og:description', desc);
		setMetaTag('property', 'og:image', img);
		setMetaTag('property', 'og:url', url);

		// Twitter card
		setMetaTag('name', 'twitter:card', img ? 'summary_large_image' : 'summary');
		setMetaTag('name', 'twitter:title', fullTitle);
		setMetaTag('name', 'twitter:description', desc);
		setMetaTag('name', 'twitter:image', img);

		setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : null);
		setCanonical(noindex ? null : url);
		setJsonLd(jsonLd ?? null);

		return () => setJsonLd(null);
	}, [title, description, image, jsonLd, noindex, ogType, lang, location.pathname]);
}
