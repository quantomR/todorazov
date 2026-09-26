// Creates a Stripe Hosted Checkout session for a card order (features.payments).
// The order is created here (service role) as pending; the webhook marks it
// paid. Pattern ported from EPPV (production). Deploy:
//   supabase functions deploy create-checkout --project-ref <ref>
//   supabase secrets set STRIPE_SECRET_KEY=sk_... SITE_URL=https://shop.com --project-ref <ref>
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-12-18.acacia' });
const SITE_URL = Deno.env.get('SITE_URL') ?? '';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});

const orderNumber = () =>
	`ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

serve(async (req) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
	try {
		const { form, items, lang } = await req.json();
		if (!Array.isArray(items) || items.length === 0) return json({ error: 'Empty cart' }, 400);

		const supabase = createClient(
			Deno.env.get('SUPABASE_URL')!,
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
		);

		// Price is recomputed server-side — never trust a client total.
		const totalEur = items.reduce(
			(sum: number, i: Record<string, number>) => sum + Number(i.priceEur) * Number(i.qty),
			0
		);
		const number = orderNumber();
		const origin = SITE_URL || req.headers.get('origin') || '';

		const { data: order, error: orderErr } = await supabase
			.from('orders')
			.insert([
				{
					order_number: number,
					client_name: `${form.firstName ?? ''} ${form.lastName ?? ''}`.trim(),
					client_email: form.email || null,
					client_phone: form.phone,
					delivery_address: { address: form.address, city: form.city, zip: form.zip },
					items,
					total_eur: totalEur,
					payment_method: 'card',
					payment_status: 'pending',
					notes: form.note || null,
				},
			])
			.select('id')
			.single();
		if (orderErr) throw orderErr;

		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			line_items: items.map((i: Record<string, unknown>) => ({
				quantity: Number(i.qty),
				price_data: {
					currency: 'eur',
					unit_amount: Math.round(Number(i.priceEur) * 100),
					product_data: { name: String(lang === 'en' ? i.nameEn : i.nameBg) },
				},
			})),
			customer_email: form.email || undefined,
			success_url: `${origin}/thank-you?order=${number}&session={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/checkout`,
			metadata: { order_id: order.id, order_number: number },
		});

		await supabase.from('orders').update({ stripe_session_id: session.id }).eq('id', order.id);

		return json({ url: session.url, orderNumber: number });
	} catch (err) {
		return json({ error: String(err) }, 500);
	}
});
