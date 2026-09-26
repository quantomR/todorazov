// Client-side faceted filtering for the shop (features.filters).
// Small brand catalogs are filtered in memory: OR within a checkbox group,
// AND across groups, numeric range match for range groups.

/** Range extents per range group across the given products. */
export function computeRangeBounds(groups, products) {
	const bounds = {};
	for (const group of groups) {
		if (group.type !== 'range') continue;
		let min = Infinity;
		let max = -Infinity;
		for (const product of products) {
			const row = (product.product_filter_values ?? []).find((v) => v.group_id === group.id);
			if (row && row.value != null) {
				const value = Number(row.value);
				if (value < min) min = value;
				if (value > max) max = value;
			}
		}
		if (min !== Infinity) bounds[group.id] = { min: Math.floor(min), max: Math.ceil(max) };
	}
	return bounds;
}

/** Does a product satisfy every active facet? */
export function matchesFilters(product, groups, value) {
	const optionIds = new Set((product.product_filter_options ?? []).map((o) => o.option_id));
	const values = new Map(
		(product.product_filter_values ?? []).map((v) => [v.group_id, Number(v.value)])
	);

	for (const group of groups) {
		if (group.type === 'checkbox') {
			const groupOptionIds = (group.filter_options ?? []).map((o) => o.id);
			const selected = value.options.filter((id) => groupOptionIds.includes(id));
			if (selected.length > 0 && !selected.some((id) => optionIds.has(id))) return false;
		} else {
			const range = value.ranges[group.id];
			if (range) {
				const v = values.get(group.id);
				if (v == null || v < range[0] || v > range[1]) return false;
			}
		}
	}
	return true;
}

/** Sort by price; "newest" keeps the fetch order (created_at desc). */
export function sortProducts(products, sort) {
	const arr = products.slice();
	if (sort === 'price_asc') arr.sort((a, b) => Number(a.price_eur) - Number(b.price_eur));
	else if (sort === 'price_desc') arr.sort((a, b) => Number(b.price_eur) - Number(a.price_eur));
	else if (sort === 'rating') arr.sort((a, b) => Number(b.rating) - Number(a.rating));
	return arr;
}
