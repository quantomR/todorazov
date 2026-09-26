import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { brand } from './src/config/brand.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Injects brand values into index.html placeholders. */
const brandHtmlPlugin = () => ({
	name: 'brand-html',
	transformIndexHtml(html) {
		const fontsLink = brand.fonts.googleFontsHref
			? `<link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    <link href="${brand.fonts.googleFontsHref}" rel="stylesheet" />`
			: '';
		return html
			.replaceAll('%BRAND_NAME%', brand.siteName)
			.replaceAll('%BRAND_DESCRIPTION%', brand.description[brand.defaultLanguage])
			.replaceAll('%BRAND_FAVICON%', brand.logo.favicon)
			.replaceAll('%BRAND_OG_IMAGE%', brand.logo.og)
			.replaceAll('%BRAND_LANG%', brand.defaultLanguage)
			.replaceAll('%BRAND_BG%', brand.semantic.bg)
			.replaceAll('<!-- %BRAND_FONTS% -->', fontsLink);
	},
});

export default defineConfig({
	plugins: [react(), brandHtmlPlugin()],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
			'@components': resolve(__dirname, 'src/components'),
			'@pages': resolve(__dirname, 'src/pages'),
			'@store': resolve(__dirname, 'src/store'),
			'@services': resolve(__dirname, 'src/services'),
			'@hooks': resolve(__dirname, 'src/hooks'),
			'@lib': resolve(__dirname, 'src/lib'),
			'@i18n': resolve(__dirname, 'src/i18n'),
			'@assets': resolve(__dirname, 'src/assets'),
		},
	},
});
