import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	Box,
	Button,
	Center,
	Container,
	Drawer,
	Grid,
	Group,
	Loader,
	Pagination,
	SegmentedControl,
	Select,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getActiveProducts, getFilterableProducts } from '@services/publicProductService';
import { getCategories } from '@services/categoryService';
import { getFilterGroupsForCategory } from '@services/filterService';
import { localized } from '@lib/localized';
import { computeRangeBounds, matchesFilters, sortProducts } from '@lib/faceting';
import ProductGrid from '@components/shop/ProductGrid';
import ProductFilters from '@components/shop/ProductFilters';
import { usePageMeta } from '@lib/meta';

const EMPTY_FILTERS = { options: [], ranges: {} };
const filtersOn = brand.features.filters;
const pageSize = brand.shop.pageSize;

function ShopPage() {
	const { t, i18n } = useTranslation();
	usePageMeta({ title: t('shop.title') });
	const [searchParams, setSearchParams] = useSearchParams();
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [groups, setGroups] = useState([]);
	const [filters, setFilters] = useState(EMPTY_FILTERS);
	const [serverPages, setServerPages] = useState(0);
	const [loading, setLoading] = useState(true);
	const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

	const categoryId = searchParams.get('category') || null;
	const sort = searchParams.get('sort') || 'newest';
	const page = Number(searchParams.get('page')) || 1;

	useEffect(() => {
		getCategories()
			.then(setCategories)
			.catch(() => {});
	}, []);

	// Filters mode: fetch all matching products + the category's filter groups
	// and do faceting client-side. Reset the active facets on category change.
	useEffect(() => {
		if (!filtersOn) return;
		/* eslint-disable-next-line react-hooks/set-state-in-effect */
		setLoading(true);
		setFilters(EMPTY_FILTERS);
		Promise.all([getFilterableProducts({ categoryId }), getFilterGroupsForCategory(categoryId)])
			.then(([prods, grps]) => {
				setProducts(prods);
				setGroups(grps);
			})
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categoryId]);

	// Non-filters mode: server-side pagination (original behaviour).
	useEffect(() => {
		if (filtersOn) return;
		getActiveProducts({ categoryId, sort, page })
			.then((result) => {
				setProducts(result.products);
				setServerPages(result.pages);
			})
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }))
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [categoryId, sort, page]);

	const bounds = useMemo(
		() => (filtersOn ? computeRangeBounds(groups, products) : {}),
		[groups, products]
	);

	const visible = useMemo(() => {
		if (!filtersOn) return { items: products, pages: serverPages };
		const filtered = products.filter((p) => matchesFilters(p, groups, filters));
		const sorted = sortProducts(filtered, sort);
		const pages = Math.ceil(sorted.length / pageSize);
		const from = (page - 1) * pageSize;
		return { items: sorted.slice(from, from + pageSize), pages };
	}, [products, groups, filters, sort, page, serverPages]);

	const updateParam = (key, value) => {
		const next = new URLSearchParams(searchParams);
		if (value) next.set(key, value);
		else next.delete(key);
		if (key !== 'page') next.delete('page');
		setSearchParams(next);
	};

	const changeFilters = (nextFilters) => {
		setFilters(nextFilters);
		updateParam('page', null);
	};

	const showSidebar = filtersOn && groups.length > 0;
	const sidebar = (
		<ProductFilters
			groups={groups}
			bounds={bounds}
			value={filters}
			onChange={changeFilters}
			onClear={() => changeFilters(EMPTY_FILTERS)}
		/>
	);

	const controls = (
		<Group justify="space-between" mb="lg" gap="sm">
			<Group gap="sm">
				{showSidebar && (
					<Button
						variant="default"
						size="xs"
						hiddenFrom="md"
						leftSection={<IconAdjustmentsHorizontal size={16} />}
						onClick={openDrawer}
					>
						{t('shop.filters')}
					</Button>
				)}
				<Select
					placeholder={t('shop.allCategories')}
					clearable
					value={categoryId}
					onChange={(value) => updateParam('category', value)}
					data={categories.map((cat) => ({
						value: cat.id,
						label: localized(cat, 'name', i18n.language),
					}))}
				/>
			</Group>
			<SegmentedControl
				size="xs"
				value={sort}
				onChange={(value) => updateParam('sort', value === 'newest' ? null : value)}
				data={[
					{ value: 'newest', label: t('shop.sortNewest') },
					{ value: 'price_asc', label: t('shop.sortPriceAsc') },
					{ value: 'price_desc', label: t('shop.sortPriceDesc') },
					...(brand.features.reviews ? [{ value: 'rating', label: t('shop.sortRating') }] : []),
				]}
			/>
		</Group>
	);

	const results = loading ? (
		<Center py="xl">
			<Loader />
		</Center>
	) : (
		<Box>
			<ProductGrid products={visible.items} />
			{visible.pages > 1 && (
				<Group justify="center" mt="xl">
					<Pagination
						total={visible.pages}
						value={page}
						onChange={(value) => updateParam('page', value === 1 ? null : String(value))}
					/>
				</Group>
			)}
		</Box>
	);

	return (
		<Container size="xl" py="xl">
			<Title order={1} c="brand" mb="lg">
				{t('shop.title')}
			</Title>

			{controls}

			{showSidebar ? (
				<Grid gutter="xl">
					<Grid.Col span={3} visibleFrom="md">
						{sidebar}
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 9 }}>{results}</Grid.Col>
				</Grid>
			) : (
				results
			)}

			<Drawer opened={drawerOpened} onClose={closeDrawer} title={t('shop.filters')} size="80%">
				{sidebar}
			</Drawer>
		</Container>
	);
}

export default ShopPage;
