import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Stack, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getFeaturedProducts, getActiveProducts } from '@services/publicProductService';
import { getLatestVideo } from '@services/youtubeService';
import { useSettingsStore } from '@store/settingsStore';
import { videoEmbed } from '@lib/video';
import { youtubeEmbedSrc } from '@lib/youtube';
import ProductGrid from '@components/shop/ProductGrid';
import roomBg from '@assets/room.svg';
import tvFrame from '@assets/tv-frame.png';
import { usePageMeta } from '@lib/meta';

// Screen cut-out of the TV artwork (src/assets/tv-hero.jpg), as a share of the
// 16:9 frame. The video overlay uses the SAME percentages inside an aspect-
// locked box, so the player stays registered to the screen at every width.
const SCREEN = { left: '12%', top: '12%', width: '76%', height: '76%' };

// Site-level structured data. Only emitted once the production URL is known,
// so previews/demos stay clean. sameAs is built from the configured socials.
function siteJsonLd() {
	if (!brand.siteUrl) return null;
	const sameAs = [brand.contact?.instagram, brand.contact?.facebook].filter(Boolean);
	return [
		{
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: brand.siteName,
			url: brand.siteUrl,
			logo: `${brand.siteUrl}${brand.logo.og}`,
			...(sameAs.length > 0 && { sameAs }),
		},
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: brand.siteName,
			url: brand.siteUrl,
		},
	];
}

function HomePage() {
	const { t } = useTranslation();
	const jsonLd = useMemo(() => siteJsonLd(), []);
	usePageMeta({ jsonLd });
	const [products, setProducts] = useState([]);
	const [fetchedVideoSrc, setFetchedVideoSrc] = useState(null);
	const pinnedVideo = useSettingsStore((s) => s.settings.pinned_video_url);
	const settingsLoaded = useSettingsStore((s) => s.isLoaded);
	// An admin-pinned link wins; otherwise fall back to the fetched latest upload.
	const pinnedVideoSrc = useMemo(
		() => (pinnedVideo ? (videoEmbed(pinnedVideo)?.src ?? null) : null),
		[pinnedVideo]
	);
	const videoSrc = pinnedVideoSrc ?? fetchedVideoSrc;

	useEffect(() => {
		getFeaturedProducts()
			.then(async (featured) => {
				if (featured.length > 0) return featured;
				const { products: latest } = await getActiveProducts({ page: 1 });
				return latest.slice(0, 4);
			})
			.then(setProducts)
			.catch(() => {});
	}, []);

	// Resolve the channel's newest upload server-side — only when autoLatest is
	// on and no video is pinned. Wait for settings so a pinned link isn't
	// briefly overridden.
	useEffect(() => {
		if (!brand.features.youtube || !brand.youtube?.autoLatest) return;
		if (!settingsLoaded || pinnedVideo) return;
		getLatestVideo(brand.youtube?.channelId)
			.then((v) => setFetchedVideoSrc(youtubeEmbedSrc(v?.videoId)))
			.catch(() => {});
	}, [settingsLoaded, pinnedVideo]);

	return (
		<Box>
			<Box
				style={{
					minHeight: 'clamp(460px, 70vh, 780px)',
					display: 'flex',
					alignItems: 'center',
					backgroundImage: `url(${roomBg})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			>
				<Container size="lg" w="100%" py="xl">
					<Stack align="center" gap="xl">
						{/* TV set in the room; the video is anchored inside its screen */}
						<Box
							w="100%"
							maw={900}
							style={{
								position: 'relative',
								aspectRatio: '16 / 9',
								backgroundImage: `url(${tvFrame})`,
								backgroundSize: 'contain',
								backgroundRepeat: 'no-repeat',
								backgroundPosition: 'center',
							}}
						>
							{videoSrc && (
								<iframe
									src={videoSrc}
									title={t('home.latestVideoTitle')}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									style={{ position: 'absolute', ...SCREEN, border: 0 }}
								/>
							)}
						</Box>

						<Button component={Link} to="/shop" size="lg" variant="white">
							{t('home.heroCta')}
						</Button>
					</Stack>
				</Container>
			</Box>

			{products.length > 0 && (
				<Container size="xl" py="xl">
					<Title order={2} ta="center" c="brand" mb="xl">
						{t('home.featuredTitle')}
					</Title>
					<ProductGrid products={products} />
				</Container>
			)}
		</Box>
	);
}

export default HomePage;
