import { supabase } from './supabase';

/**
 * Notify the admin about a new order via the send-email edge function.
 * The recipient is resolved server-side from the settings table —
 * clients cannot direct mail anywhere.
 */
export async function notifyOrder(order) {
	const { error } = await supabase.functions.invoke('send-email', {
		body: { type: 'order', order },
	});
	if (error) throw error;
}

/** Notify the admin about a new inquiry. */
export async function notifyInquiry(inquiry) {
	const { error } = await supabase.functions.invoke('send-email', {
		body: { type: 'inquiry', inquiry },
	});
	if (error) throw error;
}
