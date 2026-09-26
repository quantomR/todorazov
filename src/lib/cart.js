/**
 * Composite cart line key: same product in a different color or size
 * is a separate line.
 */
export const cartLineId = ({ productId, colorId, sizeId }) =>
	`${productId}|${colorId ?? '-'}|${sizeId ?? '-'}`;
