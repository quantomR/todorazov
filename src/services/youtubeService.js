import { supabase } from '@lib/supabase';

/**
 * Resolve the channel's newest upload via the youtube-latest Edge Function.
 * Returns { videoId, title, url, published } or null on any failure — the
 * homepage treats a null result as "no video" and simply hides the section.
 * @param {string} channelId  UC… channel id (brand.youtube.channelId)
 */
export async function getLatestVideo(channelId) {
	if (!channelId) return null;
	const { data, error } = await supabase.functions.invoke('youtube-latest', {
		body: { channelId },
	});
	if (error || !data?.videoId) return null;
	return data;
}
