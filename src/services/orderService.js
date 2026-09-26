import { supabase } from '@lib/supabase';

const generateOrderNumber = () =>
	`ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/**
 * Public checkout insert — anon RLS allows insert only, so no
 * `.select()` here. Items are the cart snapshots verbatim.
 */
export const createOrder = async ({ form, items, totalEur, deliveryAddress }) => {
	const orderNumber = generateOrderNumber();
	const { error } = await supabase.from('orders').insert([
		{
			order_number: orderNumber,
			client_name: `${form.firstName} ${form.lastName}`.trim(),
			client_email: form.email || null,
			client_phone: form.phone,
			delivery_address: deliveryAddress ?? {
				address: form.address,
				city: form.city,
				zip: form.zip,
			},
			items,
			total_eur: Number(totalEur),
			notes: form.note || null,
		},
	]);
	if (error) throw error;
	return { orderNumber };
};

/**
 * Card checkout (features.payments): the create-checkout Edge Function
 * creates a pending order + a Stripe Hosted Checkout session. Returns
 * { url, orderNumber }; the caller redirects the browser to `url`.
 */
export const startCardCheckout = async ({ form, items, lang }) => {
	const { data, error } = await supabase.functions.invoke('create-checkout', {
		body: { form, items, lang },
	});
	if (error) throw error;
	if (data?.error) throw new Error(data.error);
	return data;
};

/** Poll a card order's payment status on the thank-you page. */
export const getCardOrderStatus = async ({ orderNumber, session }) => {
	const { data, error } = await supabase.functions.invoke('order-status', {
		body: { orderNumber, session },
	});
	if (error) throw error;
	return data;
};
