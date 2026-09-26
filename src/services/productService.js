import { supabase } from '@lib/supabase';

export const getProducts = async () => {
	const { data, error } = await supabase
		.from('products')
		.select(
			'*, categories(name_bg, name_en), product_images(id, image_url, storage_path, sort_order)'
		)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data;
};

export const getProductById = async (id) => {
	const { data, error } = await supabase
		.from('products')
		.select(
			'*, product_colors(*), product_sizes(*), product_images(*), product_attributes(*), product_filter_options(option_id), product_filter_values(group_id, value)'
		)
		.eq('id', id)
		.single();
	if (error) throw error;
	return data;
};

/**
 * Save product core + colors + sizes + attributes in ONE request —
 * a single transaction via the save_product RPC. Returns the id.
 */
export const saveProduct = async (payload) => {
	const { data, error } = await supabase.rpc('save_product', { payload });
	if (error) throw error;
	return data;
};

export const updateProductFlags = async (id, flags) => {
	const { error } = await supabase.from('products').update(flags).eq('id', id);
	if (error) throw error;
};

export const deleteProduct = async (product) => {
	const paths = (product.product_images ?? []).map((img) => img.storage_path).filter(Boolean);
	if (paths.length > 0) {
		await supabase.storage.from('product-images').remove(paths);
	}
	const { error } = await supabase.from('products').delete().eq('id', product.id);
	if (error) throw error;
};
