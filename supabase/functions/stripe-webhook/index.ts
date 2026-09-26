// Stripe webhook — marks orders paid on checkout.session.completed
// (features.payments). Verify signature FIRST, then idempotency-ledger,
// then fulfil. Pattern ported from EPPV (production). Deploy:
//   supabase functions deploy stripe-webhook --no-verify-jwt --project-ref <ref>
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref <ref>
// Point a Stripe webhook endpoint at the function URL for the
// `checkout.session.completed` event.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-12-18.acacia' });
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

serve(async (req) => {
	const signature = req.headers.get('stripe-signature');
	if (!signature) return new Response('Missing signature', { status: 400 });

	// Raw body is mandatory for signature verification.
	const body = await req.text();
	let event: Stripe.Event;
	try {
		event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
	} catch (err) {
		return new Response(`Invalid signature: ${err}`, { status: 400 });
	}

	const supabase = createClient(
		Deno.env.get('SUPABASE_URL')!,
		Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
	);

	// Idempotency — ignore an event id we have already processed.
	const { error: ledgerErr } = await supabase.from('payment_events').insert([{ id: event.id }]);
	if (ledgerErr) {
		// Duplicate primary key => already handled; ack so Stripe stops retrying.
		return new Response('Already processed', { status: 200 });
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session;
		if (session.payment_status === 'paid') {
			await supabase
				.from('orders')
				.update({ payment_status: 'paid', status: 'confirmed' })
				.eq('stripe_session_id', session.id);
		}
	}

	return new Response('ok', { status: 200 });
});
