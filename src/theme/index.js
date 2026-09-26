import { createTheme } from '@mantine/core';
import { brand } from '@/config/brand';

/**
 * Builds the Mantine theme from brand config alone.
 * The palette key is always 'brand' so components can rely on
 * `color="brand"` / var(--mantine-color-brand-N) regardless of site.
 */
export function buildTheme() {
	return createTheme({
		primaryColor: 'brand',
		primaryShade: brand.primaryShade,
		colors: {
			brand: brand.palette.brand,
			...(brand.palette.dark ? { dark: brand.palette.dark } : {}),
		},
		fontFamily: brand.fonts.body,
		headings: {
			fontFamily: brand.fonts.heading,
		},
		defaultRadius: brand.defaultRadius,
		other: {
			semantic: brand.semantic,
		},
	});
}

/**
 * Exposes brand.semantic entries as global CSS variables:
 * bg → --sf-bg, surfaceAlt → --sf-surface-alt, ...
 * Components use ONLY these vars (or Mantine tokens) — never raw hex.
 */
export function cssVariablesResolver() {
	const variables = {};
	for (const [key, value] of Object.entries(brand.semantic)) {
		const cssKey = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
		variables[`--sf-${cssKey}`] = value;
	}
	return { variables, light: {}, dark: {} };
}
