import { supabase } from '@lib/supabase';

export const getDefinitions = async () => {
	const { data, error } = await supabase
		.from('attribute_definitions')
		.select('*')
		.order('sort_order', { ascending: true })
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data;
};

export const createDefinition = async ({ name_bg, name_en, collapsed, sort_order }) => {
	const { data, error } = await supabase
		.from('attribute_definitions')
		.insert([{ name_bg, name_en, collapsed, sort_order }])
		.select()
		.single();
	if (error) throw error;
	return data;
};

export const updateDefinition = async (id, { name_bg, name_en, collapsed }) => {
	const { data, error } = await supabase
		.from('attribute_definitions')
		.update({ name_bg, name_en, collapsed })
		.eq('id', id)
		.select()
		.single();
	if (error) throw error;
	return data;
};

export const deleteDefinition = async (id) => {
	const { error } = await supabase.from('attribute_definitions').delete().eq('id', id);
	if (error) throw error;
};

/**
 * Persist a new order — ONE batch upsert request. Full rows are sent
 * so the insert branch of the upsert never violates not-null columns.
 */
export const reorderDefinitions = async (definitions) => {
	const rows = definitions.map((def, index) => ({
		id: def.id,
		name_bg: def.name_bg,
		name_en: def.name_en,
		collapsed: def.collapsed,
		sort_order: index,
	}));
	const { error } = await supabase.from('attribute_definitions').upsert(rows);
	if (error) throw error;
};
