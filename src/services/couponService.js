import { supabase } from '@lib/supabase';

// Public: validate a code for a subtotal via the security-definer RPC
// (the coupons table itself is not readable by anon). Returns
// { valid, discount_eur?, reason?, min_order_eur? }.
export const validateCoupon = async (code, subtotal) => {
	const { data, error } = await supabase.rpc('validate_coupon', {
		p_code: code,
		p_subtotal: subtotal,
	});
	if (error) throw error;
	return data;
};

// Admin CRUD.
export const getCoupons = async () => {
	const { data, error } = await supabase
		.from('coupons')
		.select('*')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data;
};

export const createCoupon = async (coupon) => {
	const { data, error } = await supabase.from('coupons').insert([coupon]).select().single();
	if (error) throw error;
	return data;
};

export const updateCoupon = async (id, coupon) => {
	const { data, error } = await supabase
		.from('coupons')
		.update(coupon)
		.eq('id', id)
		.select()
		.single();
	if (error) throw error;
	return data;
};

export const deleteCoupon = async (id) => {
	const { error } = await supabase.from('coupons').delete().eq('id', id);
	if (error) throw error;
};
