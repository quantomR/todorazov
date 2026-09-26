// Discount logic (features.sales). A product can carry a discount as a
// percentage or a flat EUR amount off its price. getSale() returns the
// effective price and the % off for the badge. `base` lets callers apply the
// discount on top of a resolved price (e.g. a color price override).

export function getSale(product, base) {
	const original =
		base != null ? Number(base) : product?.price_eur == null ? null : Number(product.price_eur);

	if (!original || !product?.discount_type || product.discount_value == null) {
		return { onSale: false, price: original, original, percentOff: 0 };
	}

	const value = Number(product.discount_value);
	let sale = product.discount_type === 'percent' ? original * (1 - value / 100) : original - value;
	sale = Math.max(0, Math.round(sale * 100) / 100);

	if (!(sale < original)) {
		return { onSale: false, price: original, original, percentOff: 0 };
	}

	const percentOff = Math.round((1 - sale / original) * 100);
	return { onSale: true, price: sale, original, percentOff };
}
