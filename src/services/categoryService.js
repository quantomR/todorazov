import { supabase } from '@lib/supabase';

export const getCategories = async () => {
	const { data, error } = await supabase
		.from('categories')
		.select('*')
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data;
};

export const createCategory = async ({ name_bg, name_en }) => {
	const { data, error } = await supabase
		.from('categories')
		.insert([{ name_bg, name_en }])
		.select()
		.single();
	if (error) throw error;
	return data;
};

export const updateCategory = async (id, { name_bg, name_en }) => {
	const { data, error } = await supabase
		.from('categories')
		.update({ name_bg, name_en })
		.eq('id', id)
		.select()
		.single();
	if (error) throw error;
	return data;
};

export const deleteCategory = async (id) => {
	const { error } = await supabase.from('categories').delete().eq('id', id);
	if (error) throw error;
};
