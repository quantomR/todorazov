import { supabase } from '@lib/supabase';

/** Images for one product scoped to a color (or product-level when colorId is null). */
export const getImages = async (productId, colorId) => {
	let query = supabase
		.from('product_images')
		.select('*')
		.eq('product_id', productId)
		.order('sort_order');
	query = colorId ? query.eq('color_id', colorId) : query.is('color_id', null);
	const { data, error } = await query;
	if (error) throw error;
	return data;
};

/**
 * Upload files to storage (inherently per-file), then insert ALL
 * metadata rows with ONE batch insert request.
 */
export const uploadImages = async (files, productId, colorId, startIndex) => {
	const uploads = await Promise.all(
		files.map(async (file, i) => {
			const ext = file.name.split('.').pop();
			const path = `products/${productId}/${Date.now()}-${i}.${ext}`;
			const { error } = await supabase.storage.from('product-images').upload(path, file);
			if (error) throw error;
			const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
			return {
				product_id: productId,
				color_id: colorId,
				image_url: urlData.publicUrl,
				storage_path: path,
				sort_order: startIndex + i,
			};
		})
	);

	const { data, error } = await supabase.from('product_images').insert(uploads).select();
	if (error) throw error;
	return data;
};

export const deleteImage = async (image) => {
	await supabase.storage.from('product-images').remove([image.storage_path]);
	const { error } = await supabase.from('product_images').delete().eq('id', image.id);
	if (error) throw error;
};

/**
 * Persist a new image order — ONE batch upsert request.
 * Full rows are sent so the upsert insert branch stays valid.
 */
export const reorderImages = async (images) => {
	const rows = images.map((img, index) => ({
		id: img.id,
		product_id: img.product_id,
		color_id: img.color_id,
		image_url: img.image_url,
		storage_path: img.storage_path,
		sort_order: index,
	}));
	const { error } = await supabase.from('product_images').upsert(rows);
	if (error) throw error;
};
