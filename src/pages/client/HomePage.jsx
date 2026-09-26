import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Image, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getFeaturedProducts, getActiveProducts } from '@services/publicProductService';
import { getLatestVideo } from '@services/youtubeService';
import { useSettingsStore } from '@store/settingsStore';
import { videoEmbed } from '@lib/video';
import { youtubeEmbedSrc } from '@lib/youtube';
import ProductGrid from '@components/shop/ProductGrid';
import LatestVideo from '@components/ui/LatestVideo';
import heroImage from '@assets/hero.jpg';
import { usePageMeta } from '@lib/meta';

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
	const { t, i18n } = useTranslation();
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

	// Resolve the channel's newest upload server-side — only when no video is
	// pinned. Wait for settings so a pinned link isn't briefly overridden.
	useEffect(() => {
		if (!brand.features.youtube || !settingsLoaded || pinnedVideo) return;
		getLatestVideo(brand.youtube?.channelId)
			.then((v) => setFetchedVideoSrc(youtubeEmbedSrc(v?.videoId)))
			.catch(() => {});
	}, [settingsLoaded, pinnedVideo]);

	const tagline = brand.tagline?.[i18n.language] ?? brand.tagline?.[brand.defaultLanguage];

	return (
		<Box>
			<Box
				style={{
					position: 'relative',
					minHeight: 'min(70vh, 640px)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundImage: `url(${heroImage})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			>
				<Stack
					align="center"
					gap="lg"
					px="xl"
					py="xl"
					style={{
						background: 'color-mix(in srgb, var(--sf-bg) 72%, transparent)',
						borderRadius: 12,
					}}
				>
					<Image src={brand.logo.header} alt={brand.siteName} w="min(320px, 70vw)" fit="contain" />
					{tagline && (
						<Text size="lg" ta="center" c="dimmed">
							{tagline}
						</Text>
					)}
					<Button component={Link} to="/shop" size="md">
						{t('home.heroCta')}
					</Button>
				</Stack>
			</Box>

			{brand.features.youtube && <LatestVideo src={videoSrc} />}

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
