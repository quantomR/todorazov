import { AspectRatio } from '@mantine/core';
import { videoEmbed } from '@lib/video';

// Product video (features.video). Renders a YouTube/Vimeo iframe or a native
// <video> for direct files. Returns null for empty/unrecognised URLs.
function ProductVideo({ url }) {
	const embed = videoEmbed(url);
	if (!embed) return null;

	return (
		<AspectRatio ratio={16 / 9} mt="md">
			{embed.type === 'iframe' ? (
				<iframe
					src={embed.src}
					title="Product video"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					style={{ border: 0, borderRadius: 8 }}
				/>
			) : (
				<video src={embed.src} controls style={{ borderRadius: 8, width: '100%' }} />
			)}
		</AspectRatio>
	);
}

export default ProductVideo;
