import { supabase } from '@lib/supabase';

export const getInquiries = async () => {
	const { data, error } = await supabase
		.from('inquiries')
		.select('*')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data;
};

export const getInquiryById = async (id) => {
	const { data, error } = await supabase.from('inquiries').select('*').eq('id', id).single();
	if (error) throw error;
	return data;
};

export const updateInquiryStatus = async (id, status) => {
	const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
	if (error) throw error;
};

export const deleteInquiry = async (id) => {
	const { error } = await supabase.from('inquiries').delete().eq('id', id);
	if (error) throw error;
};
