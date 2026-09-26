// Build the privacy-friendly embed URL for a YouTube video id.
// youtube-nocookie defers cookies until playback (better for consent flows).
export function youtubeEmbedSrc(videoId) {
	return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}
