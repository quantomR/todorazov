import { supabase } from '@lib/supabase';

// Public: active price-list entries (features.services).
export const getPublicServices = async () => {
	const { data, error } = await supabase
		.from('services')
		.select('*')
		.eq('is_active', true)
		.order('sort_order');
	if (error) throw error;
	return data;
};

// Admin: all entries.
export const getServices = async () => {
	const { data, error } = await supabase.from('services').select('*').order('sort_order');
	if (error) throw error;
	return data;
};

export const createService = async (service) => {
	const { data, error } = await supabase.from('services').insert([service]).select().single();
	if (error) throw error;
	return data;
};

export const updateService = async (id, service) => {
	const { data, error } = await supabase
		.from('services')
		.update(service)
		.eq('id', id)
		.select()
		.single();
	if (error) throw error;
	return data;
};

export const deleteService = async (id) => {
	const { error } = await supabase.from('services').delete().eq('id', id);
	if (error) throw error;
};
