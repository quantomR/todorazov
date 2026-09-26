import { Outlet } from 'react-router-dom';
import { Box } from '@mantine/core';
import { brand } from '@/config/brand';
import Header from './Header';
import Footer from './Footer';
import Analytics from './Analytics';

function ClientLayout() {
	return (
		<Box style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			<Header />
			<Box component="main" style={{ flex: 1 }}>
				<Outlet />
			</Box>
			<Footer />
			{brand.features.analytics && <Analytics />}
		</Box>
	);
}

export default ClientLayout;
