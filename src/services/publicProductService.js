import { supabase } from '@lib/supabase';
import { brand } from '@/config/brand';

const PRODUCT_SELECT = '*, product_colors(*), product_sizes(*), product_images(*)';
const DETAIL_SELECT = `${PRODUCT_SELECT}, product_attributes(*)`;
const FILTER_SELECT = `${PRODUCT_SELECT}, product_filter_options(option_id), product_filter_values(group_id, value)`;

/**
 * All active products (optionally in a category) with their filter
 * associations, for client-side faceted filtering (features.filters).
 * Faceting, sorting and pagination happen in the shop component.
 */
export async function getFilterableProducts({ categoryId } = {}) {
	let query = supabase.from('products').select(FILTER_SELECT).eq('is_active', true);
	if (categoryId) query = query.eq('category_id', categoryId);
	const { data, error } = await query.order('created_at', { ascending: false });
	if (error) throw error;
	return data;
}

export async function getActiveProducts({ categoryId, sort = 'newest', page = 1 } = {}) {
	const pageSize = brand.shop.pageSize;
	let query = supabase
		.from('products')
		.select(PRODUCT_SELECT, { count: 'exact' })
		.eq('is_active', true);

	if (categoryId) query = query.eq('category_id', categoryId);

	if (sort === 'price_asc') query = query.order('price_eur', { ascending: true });
	else if (sort === 'price_desc') query = query.order('price_eur', { ascending: false });
	else if (sort === 'rating') query = query.order('rating', { ascending: false });
	else query = query.order('created_at', { ascending: false });

	const from = (page - 1) * pageSize;
	const { data, error, count } = await query.range(from, from + pageSize - 1);
	if (error) throw error;
	return { products: data, total: count ?? 0, pages: Math.ceil((count ?? 0) / pageSize) };
}

export async function getFeaturedProducts() {
	const { data, error } = await supabase
		.from('products')
		.select(PRODUCT_SELECT)
		.eq('is_active', true)
		.eq('featured', true)
		.order('created_at', { ascending: false })
		.limit(4);
	if (error) throw error;
	return data;
}

export async function getPublicProductById(id) {
	const { data, error } = await supabase
		.from('products')
		.select(DETAIL_SELECT)
		.eq('id', id)
		.eq('is_active', true)
		.single();
	if (error) throw error;
	return data;
}

/** All images sorted by sort_order (first = main). */
export const sortedImages = (images) =>
	(images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);

/** Images for a specific color, falling back to all images. */
export const imagesForColor = (images, colorId) => {
	const all = sortedImages(images);
	if (!colorId) return all;
	const forColor = all.filter((img) => img.color_id === colorId);
	return forColor.length > 0 ? forColor : all;
};

/** Colors/sizes sorted by admin-defined order. */
export const sortedOptions = (rows) =>
	(rows ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);

/** Resolved price: color override wins over the product base price. */
export const resolvePriceEur = (product, color) =>
	Number(color?.price_override_eur ?? product.price_eur ?? 0);
