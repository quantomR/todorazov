import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.8';

const GMAIL_USER = Deno.env.get('GMAIL_USER') ?? '';
const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD') ?? '';
const SITE_NAME = Deno.env.get('SITE_NAME') ?? 'Storefront';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});

const escapeHtml = (value: unknown) =>
	String(value ?? '').replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
	);

const row = (label: string, value: unknown) =>
	value
		? `<tr>
			<td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#666;font-size:13px;">${label}</td>
			<td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;font-size:13px;"><strong>${escapeHtml(value)}</strong></td>
		</tr>`
		: '';

const wrap = (title: string, body: string) => `
	<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
		<div style="background:#1a1a1a;padding:20px;text-align:center;">
			<h2 style="color:#ffffff;margin:0;">${escapeHtml(SITE_NAME)}</h2>
		</div>
		<div style="padding:20px;background:#fafafa;">
			<h3 style="margin-top:0;">${title}</h3>
			${body}
		</div>
	</div>`;

// deno-lint-ignore no-explicit-any
const orderHtml = (order: any) => {
	const address = order.form ?? {};
	const items = Array.isArray(order.items) ? order.items : [];
	const itemRows = items
		.map(
			(i: Record<string, unknown>) =>
				`<li>${escapeHtml(i.nameBg)}${i.colorNameBg ? ` · ${escapeHtml(i.colorNameBg)}` : ''}${
					i.sizeLabel ? ` · ${escapeHtml(i.sizeLabel)}` : ''
				} × ${escapeHtml(i.qty)} — €${escapeHtml(Number(i.priceEur) * Number(i.qty))}</li>`
		)
		.join('');
	return wrap(
		`Нова поръчка ${escapeHtml(order.orderNumber ?? '')}`,
		`<table style="width:100%;border-collapse:collapse;background:#fff;">
			${row('Клиент', `${address.firstName ?? ''} ${address.lastName ?? ''}`.trim())}
			${row('Телефон', address.phone)}
			${row('Имейл', address.email)}
			${row('Адрес', [address.address, address.city, address.zip].filter(Boolean).join(', '))}
			${row('Бележка', address.note)}
			${row('Сума', `€${order.totalEur}`)}
		</table>
		<ul style="font-size:13px;">${itemRows}</ul>`
	);
};

// deno-lint-ignore no-explicit-any
const inquiryHtml = (inquiry: any) =>
	wrap(
		'Ново запитване',
		`<table style="width:100%;border-collapse:collapse;background:#fff;">
			${row('Име', inquiry.name)}
			${row('Имейл', inquiry.email)}
			${row('Телефон', inquiry.phone)}
			${row('Тема', inquiry.subject)}
			${row('Съобщение', inquiry.message)}
		</table>`
	);

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// The recipient is NEVER taken from the client — it is read from
		// the settings table so the function cannot be used as a relay.
		const payload = await req.json();

		let subject: string;
		let html: string;
		if (payload.type === 'order' && payload.order) {
			subject = `Нова поръчка — ${payload.order.orderNumber ?? SITE_NAME}`;
			html = orderHtml(payload.order);
		} else if (payload.type === 'inquiry' && payload.inquiry) {
			subject = `Ново запитване — ${payload.inquiry.name ?? ''}`;
			html = inquiryHtml(payload.inquiry);
		} else {
			return json({ error: 'Unknown payload type' }, 400);
		}

		const supabase = createClient(
			Deno.env.get('SUPABASE_URL')!,
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
		);
		const { data: setting } = await supabase
			.from('settings')
			.select('value')
			.eq('key', 'admin_email')
			.single();
		const to = setting?.value;
		if (!to) {
			return json({ success: true, skipped: 'no admin_email configured' });
		}

		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 465,
			secure: true,
			auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
		});

		await transporter.sendMail({
			from: `${SITE_NAME} <${GMAIL_USER}>`,
			to,
			subject,
			html,
		});

		return json({ success: true });
	} catch (err) {
		return json({ error: String(err) }, 500);
	}
});
