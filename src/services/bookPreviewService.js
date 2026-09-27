import { supabase } from '@lib/supabase';

// The trimmed demo PDF lives in the public product-images bucket under previews/.
const BUCKET = 'product-images';

export const getPreview = async (productId) => {
	const { data, error } = await supabase
		.from('products')
		.select('preview_pdf_path, preview_pdf_pages')
		.eq('id', productId)
		.single();
	if (error) throw error;
	return data;
};

// Upload the (already trimmed) demo PDF and record it on the product — one update.
export const savePreview = async (productId, blob, pages) => {
	const path = `previews/${productId}.pdf`;
	const { error: upErr } = await supabase.storage
		.from(BUCKET)
		.upload(path, blob, { contentType: 'application/pdf', upsert: true });
	if (upErr) throw upErr;
	const { error } = await supabase
		.from('products')
		.update({ preview_pdf_path: path, preview_pdf_pages: pages })
		.eq('id', productId);
	if (error) throw error;
	return { path, pages };
};

export const removePreview = async (productId, path) => {
	if (path) await supabase.storage.from(BUCKET).remove([path]);
	const { error } = await supabase
		.from('products')
		.update({ preview_pdf_path: null, preview_pdf_pages: null })
		.eq('id', productId);
	if (error) throw error;
};

export const previewUrl = (path) =>
	/^https?:\/\//.test(path)
		? path
		: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
