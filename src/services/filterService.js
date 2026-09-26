import { supabase } from '@lib/supabase';

const GROUP_SELECT = '*, filter_options(*)';

// Admin: all filter groups with their options.
export const getFilterGroups = async () => {
	const { data, error } = await supabase
		.from('filter_groups')
		.select(GROUP_SELECT)
		.order('sort_order');
	if (error) throw error;
	return data;
};

// Public/product form: groups that apply to a category (its own + global).
export const getFilterGroupsForCategory = async (categoryId) => {
	if (!categoryId) {
		const { data, error } = await supabase
			.from('filter_groups')
			.select(GROUP_SELECT)
			.is('category_id', null)
			.order('sort_order');
		if (error) throw error;
		return data;
	}
	const { data, error } = await supabase
		.from('filter_groups')
		.select(GROUP_SELECT)
		.or(`category_id.eq.${categoryId},category_id.is.null`)
		.order('sort_order');
	if (error) throw error;
	return data;
};

/** Save a filter group + its options in ONE request (save_filter_group RPC). */
export const saveFilterGroup = async (payload) => {
	const { data, error } = await supabase.rpc('save_filter_group', { payload });
	if (error) throw error;
	return data;
};

export const deleteFilterGroup = async (id) => {
	const { error } = await supabase.from('filter_groups').delete().eq('id', id);
	if (error) throw error;
};
