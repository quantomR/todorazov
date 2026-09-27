import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppShell, Group, Text, NavLink, Button, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	IconLayoutDashboard,
	IconCategory,
	IconPackage,
	IconListDetails,
	IconFilter,
	IconShoppingBag,
	IconMessageCircle,
	IconReceipt,
	IconTicket,
	IconStar,
	IconBriefcase,
	IconInbox,
	IconSettings,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import useAuthStore from '@store/authStore';

const slug = brand.adminSlug;

const NAV_ITEMS = [
	{ path: `/${slug}`, label: 'admin.dashboard', icon: IconLayoutDashboard },
	{ path: `/${slug}/categories`, label: 'admin.categories', icon: IconCategory },
	{
		path: `/${slug}/attributes`,
		label: 'admin.attributes',
		icon: IconListDetails,
		when: brand.features.attributes,
	},
	{
		path: `/${slug}/filters`,
		label: 'admin.filters',
		icon: IconFilter,
		when: brand.features.filters,
	},
	{ path: `/${slug}/products`, label: 'admin.products', icon: IconPackage },
	{
		path: `/${slug}/orders`,
		label: 'admin.orders',
		icon: IconShoppingBag,
		when: brand.features.cart,
	},
	{
		path: `/${slug}/inquiries`,
		label: 'admin.inquiries',
		icon: IconMessageCircle,
		when: brand.features.inquiry,
	},
	{
		path: `/${slug}/services`,
		label: 'admin.services',
		icon: IconReceipt,
		when: brand.features.services,
	},
	{
		path: `/${slug}/coupons`,
		label: 'admin.coupons',
		icon: IconTicket,
		when: brand.features.coupons && brand.features.cart,
	},
	{
		path: `/${slug}/reviews`,
		label: 'admin.reviews',
		icon: IconStar,
		when: brand.features.reviews,
	},
	{
		path: `/${slug}/positions`,
		label: 'admin.positions',
		icon: IconBriefcase,
		when: brand.features.careers,
	},
	{
		path: `/${slug}/applications`,
		label: 'admin.applications',
		icon: IconInbox,
		when: brand.features.careers,
	},
	{ path: `/${slug}/settings`, label: 'admin.settings', icon: IconSettings },
].filter((item) => item.when !== false);

function AdminLayout() {
	const { t } = useTranslation();
	const location = useLocation();
	const navigate = useNavigate();
	const logout = useAuthStore((state) => state.logout);
	const [opened, { toggle }] = useDisclosure();

	const handleLogout = async () => {
		await logout();
		navigate(`/${slug}`);
	};

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
			padding="md"
		>
			<AppShell.Header style={{ background: 'var(--sf-surface)', borderColor: 'var(--sf-border)' }}>
				<Group h="100%" px="md" justify="space-between">
					<Group>
						<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
						<Text fw={700} c="brand">
							{brand.siteName} Admin
						</Text>
					</Group>
					<Button variant="subtle" color="gray" size="xs" onClick={handleLogout}>
						{t('auth.logout')}
					</Button>
				</Group>
			</AppShell.Header>

			<AppShell.Navbar
				p="xs"
				style={{ background: 'var(--sf-surface-alt)', borderColor: 'var(--sf-border)' }}
			>
				{NAV_ITEMS.map((item) => (
					<NavLink
						key={item.path}
						component={Link}
						to={item.path}
						label={t(item.label)}
						leftSection={<item.icon size={18} />}
						active={location.pathname === item.path}
						onClick={() => opened && toggle()}
					/>
				))}
			</AppShell.Navbar>

			<AppShell.Main style={{ background: 'var(--sf-bg)' }}>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	);
}

export default AdminLayout;
