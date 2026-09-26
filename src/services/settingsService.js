import { supabase } from '@lib/supabase';

export async function getSettings() {
	const { data, error } = await supabase.from('settings').select('key, value');
	if (error) throw error;
	return Object.fromEntries(data.map((row) => [row.key, row.value ?? '']));
}

/**
 * Save all settings at once — ONE batch upsert request.
 * @param {Record<string, string>} entries
 */
export async function saveSettings(entries) {
	const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
	const { error } = await supabase.from('settings').upsert(rows);
	if (error) throw error;
}
