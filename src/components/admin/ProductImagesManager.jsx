import { useEffect, useState } from 'react';
import { SimpleGrid, Stack, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { IconPhotoPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	DndContext,
	PointerSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { getImages, uploadImages, deleteImage, reorderImages } from '@services/imageService';
import SortableImageItem from './SortableImageItem';

const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Self-contained image manager for one product/color combination.
 * colorId null = product-level images (products without colors).
 */
function ProductImagesManager({ productId, colorId = null }) {
	const { t } = useTranslation();
	const [images, setImages] = useState([]);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		getImages(productId, colorId)
			.then(setImages)
			.catch(() => notifications.show({ message: t('common.error'), color: 'red' }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [productId, colorId]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
	);

	const handleDrop = async (files) => {
		setUploading(true);
		try {
			const nextSortOrder = images.reduce((max, img) => Math.max(max, img.sort_order), -1) + 1;
			const uploaded = await uploadImages(files, productId, colorId, nextSortOrder);
			setImages((current) => [...current, ...uploaded]);
		} catch {
			notifications.show({ message: t('productsAdmin.uploadError'), color: 'red' });
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async (image) => {
		try {
			await deleteImage(image);
			setImages((current) => current.filter((img) => img.id !== image.id));
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	const handleDragEnd = async ({ active, over }) => {
		if (!over || active.id === over.id) return;
		const oldIndex = images.findIndex((img) => img.id === active.id);
		const newIndex = images.findIndex((img) => img.id === over.id);
		const reordered = arrayMove(images, oldIndex, newIndex);
		setImages(reordered);
		try {
			await reorderImages(reordered);
		} catch {
			notifications.show({ message: t('common.error'), color: 'red' });
		}
	};

	return (
		<Stack gap="sm">
			<Dropzone
				onDrop={handleDrop}
				accept={IMAGE_MIME_TYPE}
				maxSize={MAX_SIZE}
				loading={uploading}
				onReject={() =>
					notifications.show({ message: t('productsAdmin.uploadReject'), color: 'red' })
				}
			>
				<Stack align="center" gap={4} py="sm">
					<IconPhotoPlus size={28} color="var(--sf-text-dim)" />
					<Text size="sm" c="dimmed" ta="center">
						{t('productsAdmin.dropzoneHint')}
					</Text>
				</Stack>
			</Dropzone>
			{images.length > 0 && (
				<>
					<Text size="xs" c="dimmed">
						{t('productsAdmin.imagesHint')}
					</Text>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
							<SimpleGrid cols={{ base: 2, xs: 3, md: 4 }} spacing="xs">
								{images.map((image, index) => (
									<SortableImageItem
										key={image.id}
										image={image}
										isMain={index === 0}
										onDelete={handleDelete}
									/>
								))}
							</SimpleGrid>
						</SortableContext>
					</DndContext>
				</>
			)}
		</Stack>
	);
}

export default ProductImagesManager;
