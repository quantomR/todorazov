/**
 * Post-build SEO artifacts: dist/robots.txt and (when brand.siteUrl is
 * set) dist/sitemap.xml with the static public routes. Product pages
 * are discovered by crawlers through /shop links.
 * Runs as part of `npm run build`.
 */
import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const { brand } = await import(new URL(`file://${join(root, 'src/config/brand.js')}`).href);

if (!existsSync(dist)) {
	console.error('dist/ not found — run vite build first');
	process.exit(1);
}

// Private routes crawlers should not index. Cart/checkout/thank-you only
// exist when the cart feature is on. The admin slug is deliberately NOT
// listed here — naming it would leak the hidden path.
const disallow = brand.features.cart ? ['/cart', '/checkout', '/thank-you'] : [];
const robots = [
	'User-agent: *',
	'Allow: /',
	...disallow.map((route) => `Disallow: ${route}`),
	...(brand.siteUrl ? [`Sitemap: ${brand.siteUrl}/sitemap.xml`] : []),
	'',
].join('\n');
writeFileSync(join(dist, 'robots.txt'), robots);
console.log('dist/robots.txt written');

if (brand.siteUrl) {
	const routes = [
		'/',
		'/shop',
		...(brand.features.inquiry ? ['/inquiry'] : []),
		...(brand.features.services ? ['/services'] : []),
		'/about',
		'/contact',
		'/privacy',
		...(brand.features.legal ? ['/terms', '/refund'] : []),
	];
	const urls = routes
		.map((route) => `\t<url><loc>${brand.siteUrl}${route}</loc></url>`)
		.join('\n');
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	writeFileSync(join(dist, 'sitemap.xml'), sitemap);
	console.log(`dist/sitemap.xml written (${routes.length} routes)`);
} else {
	console.log('sitemap skipped — brand.siteUrl is not set');
}
