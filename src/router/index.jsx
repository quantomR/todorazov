/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { brand } from '@/config/brand';

// Layouts & guards (always loaded — small, needed immediately)
import ClientLayout from '@components/ui/ClientLayout';
import AdminLayout from '@components/admin/AdminLayout';
import ProtectedRoute from '@components/ui/ProtectedRoute';

// Client pages — lazy loaded
const HomePage = lazy(() => import('@pages/client/HomePage'));
const ShopPage = lazy(() => import('@pages/client/ShopPage'));
const ProductDetailPage = lazy(() => import('@pages/client/ProductDetailPage'));
const CartPage = lazy(() => import('@pages/client/CartPage'));
const CheckoutPage = lazy(() => import('@pages/client/CheckoutPage'));
const ThankYouPage = lazy(() => import('@pages/client/ThankYouPage'));
const InquiryPage = lazy(() => import('@pages/client/InquiryPage'));
const AboutPage = lazy(() => import('@pages/client/AboutPage'));
const ContactPage = lazy(() => import('@pages/client/ContactPage'));
const ServicesPage = lazy(() => import('@pages/client/ServicesPage'));
const JoinPage = lazy(() => import('@pages/client/JoinPage'));
const PrivacyPage = lazy(() => import('@pages/client/PrivacyPage'));
const TermsPage = lazy(() => import('@pages/client/TermsPage'));
const RefundPage = lazy(() => import('@pages/client/RefundPage'));
const NotFoundPage = lazy(() => import('@pages/client/NotFoundPage'));

// Admin pages — lazy loaded (login renders inside ProtectedRoute)
const DashboardPage = lazy(() => import('@pages/admin/DashboardPage'));
const CategoriesPage = lazy(() => import('@pages/admin/CategoriesPage'));
const AttributesPage = lazy(() => import('@pages/admin/AttributesPage'));
const FiltersPage = lazy(() => import('@pages/admin/FiltersPage'));
const ProductsPage = lazy(() => import('@pages/admin/ProductsPage'));
const ProductFormPage = lazy(() => import('@pages/admin/ProductFormPage'));
const OrdersPage = lazy(() => import('@pages/admin/OrdersPage'));
const OrderDetailPage = lazy(() => import('@pages/admin/OrderDetailPage'));
const InquiriesPage = lazy(() => import('@pages/admin/InquiriesPage'));
const InquiryDetailPage = lazy(() => import('@pages/admin/InquiryDetailPage'));
const ReviewsPage = lazy(() => import('@pages/admin/ReviewsPage'));
const ServicesAdminPage = lazy(() => import('@pages/admin/ServicesAdminPage'));
const PositionsAdminPage = lazy(() => import('@pages/admin/PositionsAdminPage'));
const ApplicationsPage = lazy(() => import('@pages/admin/ApplicationsPage'));
const SettingsPage = lazy(() => import('@pages/admin/SettingsPage'));

const PageLoader = () => (
	<Center h="60vh">
		<Loader />
	</Center>
);

const S = (Component) => (
	<Suspense fallback={<PageLoader />}>
		<Component />
	</Suspense>
);

const slug = brand.adminSlug;
const { cart, inquiry, attributes, services, legal, filters, reviews, careers } = brand.features;

const clientChildren = [
	{ path: '/', element: S(HomePage) },
	{ path: '/shop', element: S(ShopPage) },
	{ path: '/shop/:id', element: S(ProductDetailPage) },
	...(cart
		? [
				{ path: '/cart', element: S(CartPage) },
				{ path: '/checkout', element: S(CheckoutPage) },
				{ path: '/thank-you', element: S(ThankYouPage) },
			]
		: []),
	...(inquiry ? [{ path: '/inquiry', element: S(InquiryPage) }] : []),
	...(services ? [{ path: '/services', element: S(ServicesPage) }] : []),
	...(careers ? [{ path: '/join', element: S(JoinPage) }] : []),
	{ path: '/about', element: S(AboutPage) },
	{ path: '/contact', element: S(ContactPage) },
	{ path: '/privacy', element: S(PrivacyPage) },
	...(legal
		? [
				{ path: '/terms', element: S(TermsPage) },
				{ path: '/refund', element: S(RefundPage) },
			]
		: []),
	{ path: '*', element: S(NotFoundPage) },
];

const adminChildren = [
	{ path: `/${slug}`, element: S(DashboardPage) },
	{ path: `/${slug}/categories`, element: S(CategoriesPage) },
	...(attributes ? [{ path: `/${slug}/attributes`, element: S(AttributesPage) }] : []),
	...(filters ? [{ path: `/${slug}/filters`, element: S(FiltersPage) }] : []),
	{ path: `/${slug}/products`, element: S(ProductsPage) },
	{ path: `/${slug}/products/new`, element: S(ProductFormPage) },
	{ path: `/${slug}/products/:id`, element: S(ProductFormPage) },
	...(cart
		? [
				{ path: `/${slug}/orders`, element: S(OrdersPage) },
				{ path: `/${slug}/orders/:id`, element: S(OrderDetailPage) },
			]
		: []),
	...(inquiry
		? [
				{ path: `/${slug}/inquiries`, element: S(InquiriesPage) },
				{ path: `/${slug}/inquiries/:id`, element: S(InquiryDetailPage) },
			]
		: []),
	...(services ? [{ path: `/${slug}/services`, element: S(ServicesAdminPage) }] : []),
	...(careers
		? [
				{ path: `/${slug}/positions`, element: S(PositionsAdminPage) },
				{ path: `/${slug}/applications`, element: S(ApplicationsPage) },
			]
		: []),
	...(reviews ? [{ path: `/${slug}/reviews`, element: S(ReviewsPage) }] : []),
	{ path: `/${slug}/settings`, element: S(SettingsPage) },
];

const router = createBrowserRouter([
	{ element: <ClientLayout />, children: clientChildren },
	{
		element: <ProtectedRoute />,
		children: [{ element: <AdminLayout />, children: adminChildren }],
	},
]);

export default router;
