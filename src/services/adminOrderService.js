import { supabase } from '@lib/supabase';

export const getOrders = async () => {
	const { data, error } = await supabase
		.from('orders')
		.select('*')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data;
};

export const getOrderById = async (id) => {
	const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
	if (error) throw error;
	return data;
};

export const updateOrderStatus = async (id, status) => {
	const { error } = await supabase.from('orders').update({ status }).eq('id', id);
	if (error) throw error;
};

export const deleteOrder = async (id) => {
	const { error } = await supabase.from('orders').delete().eq('id', id);
	if (error) throw error;
};
