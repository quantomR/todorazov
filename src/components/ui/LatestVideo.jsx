import { AspectRatio, Container, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

// Homepage "latest video" section (features.youtube). Presentational: it gets
// a ready iframe `src` (resolved from the channel RSS or an admin-pinned link)
// and renders YouTube's own player. Renders nothing without a src.
function LatestVideo({ src }) {
	const { t } = useTranslation();
	if (!src) return null;

	return (
		<Container size="md" py="xl">
			<Title order={2} ta="center" c="brand" mb="xl">
				{t('home.latestVideoTitle')}
			</Title>
			<AspectRatio ratio={16 / 9}>
				<iframe
					src={src}
					title={t('home.latestVideoTitle')}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					style={{ border: 0, borderRadius: 12 }}
				/>
			</AspectRatio>
		</Container>
	);
}

export default LatestVideo;
