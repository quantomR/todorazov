import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Badge, Box, Image } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

function SortableImageItem({ image, isMain, onDelete }) {
	const { t } = useTranslation();
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: image.id,
	});

	return (
		<Box
			ref={setNodeRef}
			pos="relative"
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				opacity: isDragging ? 0.6 : 1,
				cursor: 'grab',
				touchAction: 'none',
			}}
			{...attributes}
			{...listeners}
		>
			<Image src={image.image_url} alt="" h={110} radius="sm" fit="cover" />
			{isMain && (
				<Badge size="xs" pos="absolute" top={6} left={6} color="brand">
					{t('productsAdmin.mainImage')}
				</Badge>
			)}
			<ActionIcon
				size="sm"
				variant="filled"
				color="red"
				pos="absolute"
				top={6}
				right={6}
				onPointerDown={(e) => e.stopPropagation()}
				onClick={() => onDelete(image)}
			>
				<IconTrash size={14} />
			</ActionIcon>
		</Box>
	);
}

export default SortableImageItem;
