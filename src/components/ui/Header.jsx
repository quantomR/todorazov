import { Link, NavLink } from 'react-router-dom';
import {
	ActionIcon,
	Box,
	Burger,
	Container,
	Drawer,
	Group,
	Image,
	Indicator,
	Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconShoppingCart } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import useCartStore from '@store/cartStore';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_ITEMS = [
	{ to: '/', key: 'nav.home' },
	{ to: '/shop', key: 'nav.shop' },
	{ to: '/inquiry', key: 'nav.inquiry', when: brand.features.inquiry },
	{ to: '/services', key: 'nav.services', when: brand.features.services },
	{ to: '/about', key: 'nav.about' },
	{ to: '/contact', key: 'nav.contact' },
].filter((item) => item.when !== false);

const navLinkStyle = ({ isActive }) => ({
	textDecoration: 'none',
	color: isActive ? 'var(--sf-text)' : 'var(--sf-text-dim)',
	fontWeight: isActive ? 600 : 400,
	letterSpacing: '0.03em',
	textTransform: 'uppercase',
	fontSize: '0.85rem',
});

function Header() {
	const { t } = useTranslation();
	const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
	const totalItems = useCartStore((state) => state.items.reduce((sum, i) => sum + i.qty, 0));

	const navLinks = NAV_ITEMS.map((item) => (
		<NavLink key={item.to} to={item.to} style={navLinkStyle} onClick={closeDrawer} end>
			{t(item.key)}
		</NavLink>
	));

	return (
		<Box
			component="header"
			style={{
				position: 'sticky',
				top: 0,
				zIndex: 100,
				background: 'var(--sf-surface)',
				borderBottom: '1px solid var(--sf-border)',
			}}
		>
			<Container size="xl" py="xs">
				<Group justify="space-between" wrap="nowrap">
					<Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
						<Image src={brand.logo.header} alt={brand.siteName} h={44} w="auto" fit="contain" />
					</Link>
					<Group gap="lg" wrap="nowrap">
						<Group gap="xl" visibleFrom="sm">
							{navLinks}
							<LanguageSwitcher />
						</Group>
						{brand.features.cart && (
							<Indicator label={totalItems} size={16} disabled={totalItems === 0} color="brand">
								<ActionIcon
									component={Link}
									to="/cart"
									variant="subtle"
									size="lg"
									aria-label={t('nav.cart')}
								>
									<IconShoppingCart size={22} />
								</ActionIcon>
							</Indicator>
						)}
						<Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" size="sm" />
					</Group>
				</Group>
			</Container>
			<Drawer opened={drawerOpened} onClose={closeDrawer} size="70%" padding="lg" hiddenFrom="sm">
				<Stack gap="lg" mt="md">
					{navLinks}
					<LanguageSwitcher />
				</Stack>
			</Drawer>
		</Box>
	);
}

export default Header;
