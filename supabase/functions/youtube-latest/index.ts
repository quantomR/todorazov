import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Resolves a channel's newest upload from its PUBLIC RSS feed
// (https://www.youtube.com/feeds/videos.xml?channel_id=UC…). The browser
// cannot read that feed directly (no CORS headers), so this thin function
// fetches and parses it server-side. It only ever touches the public feed —
// no secrets, no database — and returns the newest {videoId, title, url,
// published}. Wire it to features.youtube + brand.youtube.channelId.

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			...corsHeaders,
			'Content-Type': 'application/json',
			// Cache at the edge/CDN for an hour — new uploads are not urgent.
			'Cache-Control': 'public, max-age=3600',
		},
	});

// Only accept genuine channel ids (UC + 22 url-safe chars) so the function
// cannot be pointed at arbitrary hosts.
const CHANNEL_ID = /^UC[\w-]{22}$/;

const firstMatch = (xml: string, tag: string) =>
	xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`))?.[1] ?? null;

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		let channelId: string | null = null;
		if (req.method === 'POST') {
			channelId = (await req.json().catch(() => ({}))).channelId ?? null;
		} else {
			channelId = new URL(req.url).searchParams.get('channelId');
		}

		if (!channelId || !CHANNEL_ID.test(channelId)) {
			return json({ error: 'Invalid or missing channelId' }, 400);
		}

		const res = await fetch(
			`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
		);
		if (!res.ok) {
			return json({ error: `Feed fetch failed (${res.status})` }, 502);
		}
		const xml = await res.text();

		// The first <entry> is the newest upload.
		const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
		if (!entry) {
			return json({ videoId: null });
		}

		const videoId = firstMatch(entry, 'yt:videoId');
		if (!videoId) {
			return json({ videoId: null });
		}

		return json({
			videoId,
			title: firstMatch(entry, 'title'),
			url: `https://www.youtube.com/watch?v=${videoId}`,
			published: firstMatch(entry, 'published'),
		});
	} catch (err) {
		return json({ error: String(err) }, 500);
	}
});
