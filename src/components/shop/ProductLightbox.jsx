import { ActionIcon, Box, Image, Modal, Text } from '@mantine/core';
import { useWindowEvent } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

function ProductLightbox({ images, opened, index, onClose, onChange }) {
	const prev = () => onChange((index - 1 + images.length) % images.length);
	const next = () => onChange((index + 1) % images.length);

	useWindowEvent('keydown', (e) => {
		if (!opened) return;
		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
	});

	if (images.length === 0) return null;
	const current = images[index] ?? images[0];
	const preload =
		images.length > 2
			? [images[(index + 1) % images.length], images[(index - 1 + images.length) % images.length]]
			: images.length === 2
				? [images[(index + 1) % images.length]]
				: [];

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			fullScreen
			withCloseButton={false}
			padding={0}
			transitionProps={{ transition: 'fade', duration: 150 }}
			styles={{ content: { background: 'rgba(0, 0, 0, 0.95)' }, body: { height: '100vh' } }}
		>
			<Box
				h="100%"
				pos="relative"
				style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			>
				<Image src={current.image_url} alt="" fit="contain" mah="90vh" maw="94vw" w="auto" />

				<Text pos="absolute" top={16} left={0} right={0} ta="center" c="white" fw={600}>
					{index + 1}/{images.length}
				</Text>

				<ActionIcon
					pos="absolute"
					top={12}
					right={12}
					size="lg"
					variant="subtle"
					color="gray"
					onClick={onClose}
				>
					<IconX size={24} />
				</ActionIcon>

				{images.length > 1 && (
					<>
						<ActionIcon
							pos="absolute"
							left={8}
							size="xl"
							variant="subtle"
							color="gray"
							onClick={prev}
						>
							<IconChevronLeft size={32} />
						</ActionIcon>
						<ActionIcon
							pos="absolute"
							right={8}
							size="xl"
							variant="subtle"
							color="gray"
							onClick={next}
						>
							<IconChevronRight size={32} />
						</ActionIcon>
					</>
				)}

				<Box display="none">
					{preload.map((img) => (
						<img key={img.id} src={img.image_url} alt="" />
					))}
				</Box>
			</Box>
		</Modal>
	);
}

export default ProductLightbox;
