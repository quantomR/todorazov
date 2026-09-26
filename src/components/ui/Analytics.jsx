import { useEffect, useState } from 'react';
import { Anchor, Button, Group, Paper, Portal, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';

const CONSENT_KEY = `${brand.storageKeyPrefix}-consent`;

// Inject the configured analytics script exactly once.
function injectAnalytics() {
	if (document.getElementById('analytics-script')) return;
	const { provider, id } = brand.analytics;
	if (!provider || !id) return;

	const script = document.createElement('script');
	script.id = 'analytics-script';
	if (provider === 'plausible') {
		script.defer = true;
		script.setAttribute('data-domain', id);
		script.src = 'https://plausible.io/js/script.js';
		document.head.appendChild(script);
	} else if (provider === 'ga') {
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
		document.head.appendChild(script);
		const inline = document.createElement('script');
		inline.id = 'analytics-inline';
		inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
		document.head.appendChild(inline);
	}
}

/**
 * Cookie-consent banner + gated analytics injection (features.analytics).
 * Non-essential scripts load only after the visitor accepts. The decision is
 * remembered in localStorage.
 */
function Analytics() {
	const { t } = useTranslation();
	const [decision, setDecision] = useState(() => localStorage.getItem(CONSENT_KEY));

	useEffect(() => {
		if (decision === 'accepted') injectAnalytics();
	}, [decision]);

	const decide = (value) => {
		localStorage.setItem(CONSENT_KEY, value);
		setDecision(value);
	};

	if (decision) return null;

	return (
		<Portal>
			<Paper
				withBorder
				shadow="md"
				p="md"
				style={{
					position: 'fixed',
					left: 16,
					right: 16,
					bottom: 16,
					zIndex: 300,
					maxWidth: 720,
					margin: '0 auto',
				}}
			>
				<Group justify="space-between" wrap="wrap" gap="sm">
					<Text size="sm" style={{ flex: 1, minWidth: 220 }}>
						{t('consent.text')}{' '}
						<Anchor component={Link} to="/privacy" size="sm">
							{t('privacy.title')}
						</Anchor>
					</Text>
					<Group gap="xs">
						<Button variant="default" size="xs" onClick={() => decide('declined')}>
							{t('consent.decline')}
						</Button>
						<Button size="xs" onClick={() => decide('accepted')}>
							{t('consent.accept')}
						</Button>
					</Group>
				</Group>
			</Paper>
		</Portal>
	);
}

export default Analytics;
