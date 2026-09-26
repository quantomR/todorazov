// Turn a product video URL into an embeddable descriptor.
// Supports YouTube, Vimeo and direct video files (mp4/webm/ogg).
export function videoEmbed(url) {
	if (!url) return null;
	const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
	if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` };
	const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
	if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };
	if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return { type: 'video', src: url };
	return null;
}
