import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AspectRatio, Box, Button, Container, Image, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { brand } from '@/config/brand';
import { getFeaturedProducts, getActiveProducts } from '@services/publicProductService';
import { getLatestVideo } from '@services/youtubeService';
import { useSettingsStore } from '@store/settingsStore';
import { videoEmbed } from '@lib/video';
import { youtubeEmbedSrc } from '@lib/youtube';
import ProductGrid from '@components/shop/ProductGrid';
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

	const tagline = brand.tagline?.[i18n.language] ?? brand.tagline?.[brand.defaultLanguage];

	const hasVideo = brand.features.youtube && Boolean(videoSrc);

	return (
		<Box>
			<Box
				style={{
					minHeight: hasVideo ? 'min(92vh, 900px)' : 'min(72vh, 640px)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background:
						'linear-gradient(160deg, var(--mantine-color-brand-9) 0%, var(--mantine-color-brand-7) 48%, var(--mantine-color-brand-5) 100%)',
				}}
			>
				<Container size="md" w="100%" py="xl">
					<Stack align="center" gap="xl">
						{/* Brand block — sits above the player, never over it */}
						<Stack align="center" gap="sm">
							<Image
								src={brand.logo.header}
								alt={brand.siteName}
								w="min(240px, 60vw)"
								fit="contain"
							/>
							{tagline && (
								<Text size="xl" fw={600} ta="center" c="white">
									{tagline}
								</Text>
							)}
						</Stack>

						{hasVideo && (
							<Box
								w="100%"
								maw={760}
								style={{
									borderRadius: 16,
									overflow: 'hidden',
									boxShadow:
										'0 24px 60px color-mix(in srgb, var(--mantine-color-brand-9) 60%, transparent)',
								}}
							>
								<AspectRatio ratio={16 / 9}>
									<iframe
										src={videoSrc}
										title={t('home.latestVideoTitle')}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
										style={{ border: 0 }}
									/>
								</AspectRatio>
							</Box>
						)}

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
