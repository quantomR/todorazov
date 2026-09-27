import { useEffect, useMemo, useState } from 'react';
import { ActionIcon, Box, Center, Group, Loader, Stack, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconZoomIn, IconZoomOut } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { renderPdfPages } from '@lib/pdf';
import { previewUrl } from '@services/bookPreviewService';

// Single-page book reader: one page at a time (never a clipped spread),
// rendered at high resolution so it stays crisp, with in-app zoom.
// Lazy-loaded (pdfjs is heavy).
function BookFlip({ path, pages }) {
	const { t } = useTranslation();
	const [images, setImages] = useState(null);
	const [failed, setFailed] = useState(false);
	const [idx, setIdx] = useState(0);
	const [zoom, setZoom] = useState(1);

	useEffect(() => {
		// scale 2.4 → high-res source, so zooming stays sharp
		renderPdfPages(previewUrl(path), pages, 2.4)
			.then((r) => setImages(r.images))
			.catch(() => setFailed(true));
	}, [path, pages]);

	// Base page width: fit a portrait page into the viewport height.
	const baseW = useMemo(() => {
		if (typeof window === 'undefined') return 600;
		const availH = window.innerHeight - 150;
		return Math.max(280, Math.min(window.innerWidth - 32, Math.round(availH / 1.414)));
	}, []);

	if (failed)
		return (
			<Text c="dimmed" ta="center" py="xl">
				{t('bookPreview.failed')}
			</Text>
		);
	if (!images)
		return (
			<Center py="xl">
				<Loader />
			</Center>
		);

	const n = images.length;
	const go = (delta) => setIdx((i) => Math.min(n - 1, Math.max(0, i + delta)));
	const clampZoom = (z) => Math.min(3, Math.max(1, Math.round(z * 100) / 100));

	// Click the right/left half of the page to page forward/back.
	const handlePageClick = (e) => {
		const { left, width } = e.currentTarget.getBoundingClientRect();
		go(e.clientX - left > width / 2 ? 1 : -1);
	};

	return (
		<Stack gap="xs">
			<Group justify="center" gap="sm">
				<ActionIcon variant="light" onClick={() => go(-1)} disabled={idx === 0} aria-label="prev">
					<IconChevronLeft size={18} />
				</ActionIcon>
				<Text size="sm" w={72} ta="center">
					{idx + 1} / {n}
				</Text>
				<ActionIcon
					variant="light"
					onClick={() => go(1)}
					disabled={idx === n - 1}
					aria-label="next"
				>
					<IconChevronRight size={18} />
				</ActionIcon>
				<ActionIcon
					variant="light"
					onClick={() => setZoom((z) => clampZoom(z - 0.25))}
					disabled={zoom <= 1}
					aria-label="zoom out"
				>
					<IconZoomOut size={18} />
				</ActionIcon>
				<Text size="sm" w={52} ta="center">
					{Math.round(zoom * 100)}%
				</Text>
				<ActionIcon
					variant="light"
					onClick={() => setZoom((z) => clampZoom(z + 0.25))}
					disabled={zoom >= 3}
					aria-label="zoom in"
				>
					<IconZoomIn size={18} />
				</ActionIcon>
			</Group>

			<Box
				style={{
					height: 'min(82vh, 900px)',
					overflow: 'auto',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'flex-start',
					background: 'var(--mantine-color-dark-8)',
					borderRadius: 8,
				}}
			>
				<img
					key={idx}
					src={images[idx]}
					alt={`${idx + 1}`}
					onClick={handlePageClick}
					style={{
						width: baseW * zoom,
						maxWidth: 'none',
						height: 'auto',
						cursor: 'pointer',
						boxShadow:
							'0 10px 40px color-mix(in srgb, var(--mantine-color-black) 45%, transparent)',
					}}
				/>
			</Box>
		</Stack>
	);
}

export default BookFlip;
