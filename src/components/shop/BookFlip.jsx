import { useEffect, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Center, Loader, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { renderPdfPages } from '@lib/pdf';
import { previewUrl } from '@services/bookPreviewService';

// Public flipbook: renders the trimmed demo PDF page-by-page into a
// bookstore-style page-flip. Lazy-loaded (pdfjs + react-pageflip are heavy).
function BookFlip({ path, pages }) {
	const { t } = useTranslation();
	const [images, setImages] = useState(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		renderPdfPages(previewUrl(path), pages)
			.then((r) => setImages(r.images))
			.catch(() => setFailed(true));
	}, [path, pages]);

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

	const width = Math.min(420, (typeof window !== 'undefined' ? window.innerWidth : 800) - 80);
	const height = Math.round(width * 1.41);

	return (
		<Center>
			<HTMLFlipBook
				width={width}
				height={height}
				maxShadowOpacity={0.4}
				showCover
				mobileScrollSupport
			>
				{images.map((src, i) => (
					<div key={i} style={{ background: 'var(--mantine-color-white)' }}>
						<img
							src={src}
							alt={`${i + 1}`}
							style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
						/>
					</div>
				))}
			</HTMLFlipBook>
		</Center>
	);
}

export default BookFlip;
