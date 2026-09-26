import { supabase } from '@lib/supabase';

// Public: approved reviews for a product (RLS hides unapproved from anon).
export const getApprovedReviews = async (productId) => {
	const { data, error } = await supabase
		.from('reviews')
		.select('*')
		.eq('product_id', productId)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data;
};

// Public submission — inserted unapproved (RLS forces is_approved = false),
// no .select() back (anon has no read on unapproved rows).
export const submitReview = async ({ product_id, author_name, rating, comment }) => {
	const { error } = await supabase
		.from('reviews')
		.insert([{ product_id, author_name, rating, comment: comment || null, is_approved: false }]);
	if (error) throw error;
};

// Admin: all reviews (approved + pending).
export const getAllReviews = async () => {
	const { data, error } = await supabase
		.from('reviews')
		.select('*, products(name_bg, name_en)')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data;
};

export const setReviewApproved = async (id, is_approved) => {
	const { error } = await supabase.from('reviews').update({ is_approved }).eq('id', id);
	if (error) throw error;
};

export const deleteReview = async (id) => {
	const { error } = await supabase.from('reviews').delete().eq('id', id);
	if (error) throw error;
};
