import { useState } from 'react';
import { AspectRatio, Badge, Box, Image } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import ProductThumbnails from './ProductThumbnails';
import ProductLightbox from './ProductLightbox';

/**
 * Render with a `key` tied to the selected color so the gallery
 * remounts (and resets to the first image) when the image set changes.
 */
function ProductGallery({ images, title }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [lightboxOpened, setLightboxOpened] = useState(false);

	if (images.length === 0) {
		return (
			<AspectRatio ratio={1}>
				<Box
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						borderRadius: 8,
						background: 'var(--sf-surface-alt)',
					}}
				>
					<IconPhoto size={64} color="var(--sf-text-dim)" />
				</Box>
			</AspectRatio>
		);
	}

	const openLightbox = (index) => {
		setActiveIndex(index);
		setLightboxOpened(true);
	};

	const current = images[activeIndex] ?? images[0];

	return (
		<Box>
			<Box pos="relative" style={{ cursor: 'zoom-in' }} onClick={() => openLightbox(activeIndex)}>
				<AspectRatio ratio={1}>
					<Image src={current.image_url} alt={title} fit="cover" radius="md" />
				</AspectRatio>
				<Badge pos="absolute" bottom={10} right={10} variant="filled" color="brand">
					{activeIndex + 1}/{images.length}
				</Badge>
			</Box>
			<ProductThumbnails
				images={images}
				activeIndex={activeIndex}
				onSelect={setActiveIndex}
				onOverflowClick={openLightbox}
			/>
			<ProductLightbox
				images={images}
				opened={lightboxOpened}
				index={activeIndex}
				onClose={() => setLightboxOpened(false)}
				onChange={setActiveIndex}
			/>
		</Box>
	);
}

export default ProductGallery;
