import { supabase } from '@lib/supabase';

// Public: only the open positions, for the join page.
export const getOpenPositions = async () => {
	const { data, error } = await supabase
		.from('positions')
		.select('*')
		.eq('is_open', true)
		.order('sort_order');
	if (error) throw error;
	return data;
};

// Admin: all positions.
export const getPositions = async () => {
	const { data, error } = await supabase.from('positions').select('*').order('sort_order');
	if (error) throw error;
	return data;
};

export const createPosition = async (position) => {
	const { data, error } = await supabase.from('positions').insert([position]).select().single();
	if (error) throw error;
	return data;
};

export const updatePosition = async (id, position) => {
	const { data, error } = await supabase
		.from('positions')
		.update(position)
		.eq('id', id)
		.select()
		.single();
	if (error) throw error;
	return data;
};

export const deletePosition = async (id) => {
	const { error } = await supabase.from('positions').delete().eq('id', id);
	if (error) throw error;
};
