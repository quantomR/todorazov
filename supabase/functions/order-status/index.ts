// Public order-status lookup for the thank-you page to poll card payments
// (features.payments). Anon cannot read the orders table directly (insert-only
// RLS), so this service-role function returns just the payment status, matched
// by order_number + stripe session id. Deploy:
//   supabase functions deploy order-status --project-ref <ref>
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});

serve(async (req) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
	try {
		const { orderNumber, session } = await req.json();
		if (!orderNumber || !session) return json({ error: 'Missing params' }, 400);

		const supabase = createClient(
			Deno.env.get('SUPABASE_URL')!,
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
		);
		const { data, error } = await supabase
			.from('orders')
			.select('payment_status')
			.eq('order_number', orderNumber)
			.eq('stripe_session_id', session)
			.single();
		if (error) return json({ error: 'Not found' }, 404);

		return json({ paymentStatus: data.payment_status });
	} catch (err) {
		return json({ error: String(err) }, 500);
	}
});
