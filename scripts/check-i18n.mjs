/** Fails when bg.json and en.json key sets differ. */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (f) => JSON.parse(readFileSync(join(root, 'src/i18n', f), 'utf8'));

const flat = (obj, prefix = '') =>
	Object.entries(obj).flatMap(([key, value]) =>
		typeof value === 'object' && value !== null
			? flat(value, `${prefix}${key}.`)
			: [`${prefix}${key}`]
	);

const bg = new Set(flat(load('bg.json')));
const en = new Set(flat(load('en.json')));

const onlyBg = [...bg].filter((k) => !en.has(k));
const onlyEn = [...en].filter((k) => !bg.has(k));

if (onlyBg.length || onlyEn.length) {
	if (onlyBg.length) console.error('Missing in en.json:', onlyBg.join(', '));
	if (onlyEn.length) console.error('Missing in bg.json:', onlyEn.join(', '));
	process.exit(1);
}
console.log(`i18n parity OK (${bg.size} keys)`);
