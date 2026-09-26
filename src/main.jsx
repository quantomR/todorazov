import { StrictMode } from 'react';

// Auto-reload when a lazy-loaded chunk fails after a new deployment.
// This listener must stay above the other imports.
window.addEventListener('unhandledrejection', (e) => {
	const msg = e?.reason?.message ?? '';
	if (
		msg.includes('Failed to fetch dynamically imported module') ||
		msg.includes('Importing a module script failed')
	) {
		window.location.reload();
	}
});
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import './index.css';
import '@i18n/i18n';
import { brand } from '@/config/brand';
import { buildTheme, cssVariablesResolver } from '@/theme';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<MantineProvider
			theme={buildTheme()}
			forceColorScheme={brand.colorScheme}
			cssVariablesResolver={cssVariablesResolver}
		>
			<Notifications position="top-right" />
			<App />
		</MantineProvider>
	</StrictMode>
);
