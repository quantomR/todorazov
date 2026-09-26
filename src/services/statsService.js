import { supabase } from '@lib/supabase';
import { brand } from '@/config/brand';

const count = (table, filter) => {
	let query = supabase.from(table).select('id', { count: 'exact', head: true });
	if (filter) query = filter(query);
	return query;
};

export async function getDashboardStats() {
	const queries = [
		{ key: 'totalProducts', promise: count('products') },
		{ key: 'activeProducts', promise: count('products', (q) => q.eq('is_active', true)) },
	];
	if (brand.features.cart) {
		queries.push({ key: 'newOrders', promise: count('orders', (q) => q.eq('status', 'new')) });
	}
	if (brand.features.inquiry) {
		queries.push({
			key: 'newInquiries',
			promise: count('inquiries', (q) => q.eq('status', 'new')),
		});
	}

	const results = await Promise.all(queries.map((q) => q.promise));
	const failed = results.find((r) => r.error);
	if (failed) throw failed.error;

	return Object.fromEntries(queries.map((q, i) => [q.key, results[i].count ?? 0]));
}
