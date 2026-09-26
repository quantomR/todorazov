import { AspectRatio, Box, Image, SimpleGrid, Text } from '@mantine/core';

const MAX_THUMBS = 4;

function ProductThumbnails({ images, activeIndex, onSelect, onOverflowClick }) {
	if (images.length <= 1) return null;

	const thumbs = images.slice(0, MAX_THUMBS);
	const overflow = images.length - MAX_THUMBS;

	return (
		<SimpleGrid cols={4} spacing="xs" mt="xs">
			{thumbs.map((image, index) => {
				const isOverflowTile = overflow > 0 && index === MAX_THUMBS - 1;
				return (
					<Box
						key={image.id}
						pos="relative"
						onClick={() => (isOverflowTile ? onOverflowClick(index) : onSelect(index))}
						style={{
							cursor: 'pointer',
							borderRadius: 6,
							overflow: 'hidden',
							outline:
								index === activeIndex
									? '2px solid var(--mantine-color-brand-5)'
									: '1px solid var(--sf-border)',
						}}
					>
						<AspectRatio ratio={1}>
							<Image src={image.image_url} alt="" fit="cover" loading="lazy" />
						</AspectRatio>
						{isOverflowTile && (
							<Box
								pos="absolute"
								inset={0}
								style={{
									background: 'rgba(0, 0, 0, 0.55)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Text fw={700} c="white">
									+{overflow}
								</Text>
							</Box>
						)}
					</Box>
				);
			})}
		</SimpleGrid>
	);
}

export default ProductThumbnails;
