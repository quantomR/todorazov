/**
 * Guards the branding discipline:
 * - no raw hex colors outside src/config and src/theme
 * - no hardcoded fontFamily outside src/theme
 * - the literal brand siteName must not appear outside src/config
 *   (display goes through brand.siteName or the {{brand}} i18n variable)
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, relative, sep } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const { brand } = await import(new URL(`file://${join(srcDir, 'config/brand.js')}`).href);

const EXEMPT = [`config${sep}`, `theme${sep}`];
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const FONT_RE = /font-family\s*:|fontFamily\s*:/g;

const walk = (dir) =>
	readdirSync(dir).flatMap((name) => {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) return walk(full);
		return /\.(jsx?|css)$/.test(name) ? [full] : [];
	});

const problems = [];
for (const file of walk(srcDir)) {
	const rel = relative(srcDir, file);
	if (EXEMPT.some((prefix) => rel.startsWith(prefix))) continue;
	const content = readFileSync(file, 'utf8');

	const hexes = content.match(HEX_RE);
	if (hexes) problems.push(`${rel}: raw hex ${[...new Set(hexes)].join(', ')}`);

	if (FONT_RE.test(content)) problems.push(`${rel}: hardcoded fontFamily`);

	if (!rel.startsWith(`i18n${sep}`) && content.includes(brand.siteName)) {
		problems.push(`${rel}: literal brand name "${brand.siteName}" (use brand.siteName)`);
	}
}

if (problems.length) {
	console.error('Theme discipline violations:');
	for (const p of problems) console.error('  ' + p);
	process.exit(1);
}
console.log('theme discipline OK');
