import { supabase } from '@lib/supabase';

// Weekly opening hours (features.hours). One row per weekday (day 0 = Monday
// .. 6 = Sunday); `hours` is free text (e.g. "09:00 – 18:00"), `closed` hides it.
export const getBusinessHours = async () => {
	const { data, error } = await supabase.from('business_hours').select('*').order('day');
	if (error) throw error;
	return data;
};

// Upsert all rows at once (used by the admin editor) — ONE request.
export const saveBusinessHours = async (rows) => {
	const { error } = await supabase.from('business_hours').upsert(rows, { onConflict: 'day' });
	if (error) throw error;
};
