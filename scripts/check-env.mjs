/**
 * Guardrail against committing secrets in env files.
 *
 * Only `.env.example` (placeholders) may be tracked by git. Real env files
 * (.env, .env.local) are gitignored. This check makes a leaked secret
 * impossible to merge:
 *   1) only the allowlisted env file(s) may be tracked,
 *   2) every key in them must be VITE_-prefixed (client-public by design),
 *   3) no value may match a known secret shape (defense in depth).
 *
 * Runs via `npm run check:env` (part of `npm run check`) and, optionally,
 * as a pre-commit hook. No-ops outside a git context.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ALLOWLIST = new Set(['.env.example']);

// Known secret shapes — a value matching any of these must never be committed.
const SECRET_PATTERNS = [
	{ re: /sb_secret_/, label: 'Supabase secret key (sb_secret_…)' },
	{ re: /\bsk_(live|test)_[0-9a-zA-Z]/, label: 'Stripe secret key (sk_…)' },
	{ re: /\brk_(live|test)_[0-9a-zA-Z]/, label: 'Stripe restricted key (rk_…)' },
	{ re: /\bwhsec_[0-9a-zA-Z]/, label: 'Stripe webhook secret (whsec_…)' },
	{ re: /re_[0-9a-zA-Z]{16,}/, label: 'Resend API key (re_…)' },
	{ re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, label: 'PEM private key' },
];

let tracked = [];
try {
	const out = execFileSync('git', ['ls-files', '-z', '.env*'], { encoding: 'utf8' });
	tracked = out.split('\0').filter(Boolean);
} catch {
	console.log('check:env skipped — not a git context');
	process.exit(0);
}

const violations = [];

for (const file of tracked) {
	if (!ALLOWLIST.has(file)) {
		violations.push(
			`${file}: unexpected committed env file. Only ${[...ALLOWLIST].join(', ')} may be ` +
				`tracked; real env files must be gitignored.`
		);
		continue;
	}

	const lines = readFileSync(file, 'utf8').split(/\r?\n/);
	lines.forEach((raw, i) => {
		const line = raw.trim();
		if (line === '' || line.startsWith('#')) return;
		const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
		if (!match) return; // not a KEY=VALUE assignment
		const [, key, value] = match;

		if (!key.startsWith('VITE_')) {
			violations.push(
				`${file}:${i + 1}: key "${key}" is not VITE_-prefixed. Committed env files carry only ` +
					`client-public values; server secrets go to Supabase secrets / an untracked .env.`
			);
		}

		for (const { re, label } of SECRET_PATTERNS) {
			if (re.test(value)) {
				violations.push(`${file}:${i + 1}: value of "${key}" looks like a ${label} — secret in git!`);
			}
		}
	});
}

if (violations.length > 0) {
	console.error('env file check FAILED:');
	for (const v of violations) console.error('  ' + v);
	process.exit(1);
}

console.log(`check:env OK (${tracked.length} tracked env file(s), client-public only)`);
